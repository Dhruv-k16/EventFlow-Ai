// src/app/api/vendors/[id]/inventory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma }   from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { toUTCMidnight } from '@/lib/slotEngine';

type VariantAvailRow = { bookedQty: number; holdQty: number };
// FIX: was dailyAvailability — relation name is VariantAvailability in schema
type VariantRow = {
  id: string; itemId: string; name: string; sku: string | null;
  totalQuantity: number; bookedQuantity: number; priceOverride: unknown;
  color: string | null; material: string | null; dimensions: string | null;
  attributes: unknown; imageUrl: string | null; createdAt: Date; updatedAt: Date;
  VariantAvailability: VariantAvailRow[]; // FIX: was dailyAvailability
};
// FIX: was variants/dailyAllocations — relation names are InventoryVariant/InventoryAllocation
type ItemRow = {
  id: string; vendorId: string; name: string; description: string | null;
  basePrice: unknown; unit: string; imageUrl: string | null;
  hasVariants: boolean; totalQuantity: number;
  InventoryVariant:   VariantRow[];            // FIX: was variants
  InventoryAllocation: { allocatedQty: number }[]; // FIX: was dailyAllocations
  createdAt: Date; updatedAt: Date;
};

function formatVariant(v: VariantRow, parentBasePrice: number) {
  // FIX: was v.dailyAvailability — now v.VariantAvailability
  const avail = v.VariantAvailability[0];
  const price = v.priceOverride != null ? Number(v.priceOverride) : parentBasePrice;
  return {
    id: v.id, itemId: v.itemId, name: v.name, sku: v.sku,
    totalQuantity: v.totalQuantity, bookedQuantity: v.bookedQuantity,
    availableQty: v.totalQuantity - (avail?.bookedQty ?? 0) - (avail?.holdQty ?? 0),
    allocatedQty: avail?.bookedQty ?? 0, holdQty: avail?.holdQty ?? 0,
    price, priceOverride: v.priceOverride != null ? Number(v.priceOverride) : null,
    color: v.color, material: v.material, dimensions: v.dimensions,
    attributes: v.attributes ?? {}, imageUrl: v.imageUrl,
    createdAt: v.createdAt.toISOString(), updatedAt: v.updatedAt.toISOString(),
  };
}

function formatItem(item: ItemRow, targetDate: Date) {
  const basePrice = Number(item.basePrice);
  // FIX: was item.variants — now item.InventoryVariant
  if (item.hasVariants && item.InventoryVariant.length > 0) {
    const totalQty     = item.InventoryVariant.reduce((s, v) => s + v.totalQuantity, 0);
    const allocatedQty = item.InventoryVariant.reduce((s, v) => s + (v.VariantAvailability[0]?.bookedQty ?? 0), 0);
    const holdQty      = item.InventoryVariant.reduce((s, v) => s + (v.VariantAvailability[0]?.holdQty   ?? 0), 0);
    return {
      id: item.id, vendorId: item.vendorId, name: item.name,
      description: item.description, basePrice, unit: item.unit,
      imageUrl: item.imageUrl, hasVariants: true, totalQuantity: totalQty,
      availableQty: totalQty - allocatedQty - holdQty, allocatedQty, holdQty,
      variants: item.InventoryVariant.map(v => formatVariant(v, basePrice)), // FIX: was item.variants
      date: targetDate.toISOString().split('T')[0],
      createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(),
    };
  }
  // FIX: was item.dailyAllocations — now item.InventoryAllocation
  const alloc = item.InventoryAllocation[0];
  return {
    id: item.id, vendorId: item.vendorId, name: item.name,
    description: item.description, basePrice, unit: item.unit,
    imageUrl: item.imageUrl, hasVariants: false, totalQuantity: item.totalQuantity,
    availableQty: item.totalQuantity - (alloc?.allocatedQty ?? 0),
    allocatedQty: alloc?.allocatedQty ?? 0, holdQty: 0, variants: [],
    date: targetDate.toISOString().split('T')[0],
    createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // FIX: was const { id } = params — Next.js 15 requires await
  const { id } = await params;
  const targetDate = toUTCMidnight(new URL(req.url).searchParams.get('date') ?? new Date());
  try {
    const vendor = await prisma.vendor.findUnique({ where: { id }, select: { id: true, businessName: true } });
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    const items = await prisma.inventoryItem.findMany({
      where: { vendorId: id },
      include: {
        // FIX: were variants/dailyAllocations — now InventoryVariant/InventoryAllocation
        InventoryVariant:   {
          include: { VariantAvailability: { where: { date: targetDate } } }, // FIX: was dailyAvailability
          orderBy: { name: 'asc' },
        },
        InventoryAllocation: { where: { date: targetDate } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      vendorId: vendor.id, businessName: vendor.businessName,
      date: targetDate.toISOString().split('T')[0],
      items: (items as unknown as ItemRow[]).map(i => formatItem(i, targetDate)),
    });
  } catch (err) {
    console.error('[GET /api/vendors/[id]/inventory]', err);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export const POST = withAuth<{ id: string }>(
  async (req, { params }, user) => {
    const { id } = await (params as unknown as Promise<{ id: string }>);
    if (user.role === 'VENDOR' && user.vendorId !== id)
      return NextResponse.json({ error: 'You can only manage your own inventory' }, { status: 403 });
    try {
      const body = await req.json() as {
        name: string; description?: string; basePrice: number;
        unit?: string; imageUrl?: string; totalQuantity?: number;
        variants?: { name: string; sku?: string; totalQuantity: number; priceOverride?: number;
          color?: string; material?: string; dimensions?: string;
          attributes?: Record<string, unknown>; imageUrl?: string; }[];
      };
      const { name, description, basePrice, unit, imageUrl, totalQuantity, variants } = body;
      if (!name || basePrice === undefined)
        return NextResponse.json({ error: 'name and basePrice are required' }, { status: 400 });
      if (basePrice < 0)
        return NextResponse.json({ error: 'basePrice cannot be negative' }, { status: 400 });

      const vendor = await prisma.vendor.findUnique({ where: { id }, select: { id: true } });
      if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

      const hasVariants = Array.isArray(variants) && variants.length > 0;
      if (!hasVariants && (!totalQuantity || totalQuantity < 1))
        return NextResponse.json({ error: 'totalQuantity required when not using variants' }, { status: 400 });

      const derivedQty = hasVariants
        ? variants!.reduce((s, v) => s + (v.totalQuantity ?? 0), 0)
        : (totalQuantity ?? 0);

      const item = await prisma.inventoryItem.create({
        data: {
          vendorId: id, name: name.trim(), description: description?.trim() ?? null,
          basePrice, unit: unit?.trim() ?? 'per unit', imageUrl: imageUrl ?? null,
          hasVariants, totalQuantity: derivedQty,
        } as unknown as Prisma.InventoryItemCreateInput,
      });

      if (hasVariants && variants) {
        await prisma.$transaction(variants.map(v =>
          prisma.inventoryVariant.create({
            data: {
              // FIX: InventoryVariant has no @default(uuid()) — must supply id + updatedAt
              id:            crypto.randomUUID(),
              updatedAt:     new Date(),
              itemId:        item.id,
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
        ));
      }

      // FIX: was include: { variants: true } — now InventoryVariant
      const full = await prisma.inventoryItem.findUnique({
        where: { id: item.id }, include: { InventoryVariant: true },
      });
      return NextResponse.json(full, { status: 201 });
    } catch (err) {
      console.error('[POST /api/vendors/[id]/inventory]', err);
      return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
    }
  },
  ['VENDOR', 'ADMIN']
);
