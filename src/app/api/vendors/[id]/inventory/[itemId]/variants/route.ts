// src/app/api/vendors/[id]/inventory/[itemId]/variants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma }   from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

type Params = { id: string; itemId: string };

async function syncParentQty(itemId: string) {
  const agg = await prisma.inventoryVariant.aggregate({ where: { itemId }, _sum: { totalQuantity: true } });
  await prisma.inventoryItem.update({ where: { id: itemId }, data: { totalQuantity: agg._sum.totalQuantity ?? 0 } });
}

async function checkOwnership(vendorId: string, itemId: string, userId: string, role: string) {
  if (role === 'ADMIN') return true;
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId }, select: { vendorId: true } });
  return item?.vendorId === vendorId;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  const { itemId } = await params;
  try {
    const item = await prisma.inventoryItem.findUnique({
      where:   { id: itemId },
      // FIX: was variants — relation name is InventoryVariant in schema
      include: { InventoryVariant: { orderBy: { name: 'asc' } } },
    });
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    return NextResponse.json({
      itemId:        item.id,
      itemName:      item.name,
      hasVariants:   item.hasVariants,
      totalQuantity: item.totalQuantity,
      variants:      item.InventoryVariant, // FIX: was item.variants
    });
  } catch (err) {
    console.error('[GET variants]', err);
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
  }
}

export const POST = withAuth<Params>(
  async (req, { params }, user) => {
    const { id, itemId } = await params;
    const owns = await checkOwnership(id, itemId, user.sub, user.role);
    if (!owns) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    try {
      const body = await req.json() as {
        variants: {
          name: string; sku?: string; totalQuantity: number;
          priceOverride?: number; color?: string; material?: string;
          dimensions?: string; attributes?: Record<string, unknown>; imageUrl?: string;
        }[];
      };

      if (!Array.isArray(body.variants) || body.variants.length === 0)
        return NextResponse.json({ error: 'variants array required' }, { status: 400 });
      for (const v of body.variants) {
        if (!v.name || v.totalQuantity === undefined)
          return NextResponse.json({ error: 'Each variant needs name and totalQuantity' }, { status: 400 });
      }

      const created = await prisma.$transaction(
        body.variants.map(v =>
          prisma.inventoryVariant.create({
            data: {
              // FIX: InventoryVariant has no @default(uuid()) — must supply id + updatedAt
              id:            crypto.randomUUID(),
              updatedAt:     new Date(),
              itemId,
              name:          v.name.trim(),
              sku:           v.sku?.trim() ?? null,
              totalQuantity: v.totalQuantity,
              bookedQuantity: 0,
              priceOverride: v.priceOverride ?? null,
              color:         v.color ?? null,
              material:      v.material ?? null,
              dimensions:    v.dimensions ?? null,
              attributes:    v.attributes != null ? v.attributes as Prisma.InputJsonValue : Prisma.JsonNull,
              imageUrl:      v.imageUrl ?? null,
            },
          })
        )
      );

      await prisma.inventoryItem.update({ where: { id: itemId }, data: { hasVariants: true } });
      await syncParentQty(itemId);

      return NextResponse.json({ added: created.length, variants: created }, { status: 201 });
    } catch (err) {
      console.error('[POST variants]', err);
      return NextResponse.json({ error: 'Failed to add variants' }, { status: 500 });
    }
  },
  ['VENDOR', 'ADMIN']
);
