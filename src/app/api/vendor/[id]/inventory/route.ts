// src/app/api/vendor/[id]/inventory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { toUTCMidnight } from '@/lib/slotEngine';

// FIX: updated type to use InventoryAllocation instead of dailyAllocations
type InvItemWithAlloc = {
  id: string; vendorId: string; name: string; description: string | null;
  totalQuantity: number; basePrice: number | { toString(): string };
  unit: string; imageUrl: string | null;
  InventoryAllocation: { allocatedQty: number }[]; // FIX: was dailyAllocations
  createdAt: Date; updatedAt: Date;
};

const fmt = (item: InvItemWithAlloc) => ({
  id: item.id, vendorId: item.vendorId, name: item.name,
  description: item.description, totalQuantity: item.totalQuantity,
  basePrice: Number(item.basePrice), unit: item.unit, imageUrl: item.imageUrl,
  // FIX: was item.dailyAllocations — now item.InventoryAllocation
  availableQty: item.totalQuantity - (item.InventoryAllocation[0]?.allocatedQty ?? 0),
  allocatedQty: item.InventoryAllocation[0]?.allocatedQty ?? 0,
  createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const targetDate = toUTCMidnight(new URL(req.url).searchParams.get('date') ?? new Date());
  try {
    const vendor = await prisma.vendor.findUnique({ where: { id }, select: { id: true, businessName: true } });
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    const items = await prisma.inventoryItem.findMany({
      where:   { vendorId: id },
      // FIX: was dailyAllocations — relation name is InventoryAllocation in schema
      include: { InventoryAllocation: { where: { date: targetDate } } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      vendorId: vendor.id, businessName: vendor.businessName,
      date:  targetDate.toISOString().split('T')[0],
      items: (items as unknown as InvItemWithAlloc[]).map(fmt),
    });
  } catch (err) {
    console.error('[GET /api/vendor/[id]/inventory]', err);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export const POST = withAuth<{ id: string }>(
  async (req, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
    if (user.role === 'VENDOR' && user.vendorId !== id)
      return NextResponse.json({ error: 'You can only manage your own inventory' }, { status: 403 });
    try {
      const { name, description, totalQuantity, basePrice, unit, imageUrl } = await req.json();
      if (!name || totalQuantity === undefined || basePrice === undefined)
        return NextResponse.json({ error: 'name, totalQuantity, and basePrice are required' }, { status: 400 });
      if (totalQuantity < 1) return NextResponse.json({ error: 'totalQuantity must be at least 1' }, { status: 400 });
      if (basePrice < 0)     return NextResponse.json({ error: 'basePrice cannot be negative' }, { status: 400 });

      const vendor = await prisma.vendor.findUnique({ where: { id }, select: { id: true } });
      if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

      const item = await prisma.inventoryItem.create({
        data: {
          vendorId: id, name: name.trim(),
          description: description?.trim() ?? null,
          totalQuantity: Math.floor(totalQuantity),
          basePrice, unit: unit?.trim() ?? 'per unit',
          imageUrl: imageUrl ?? null,
        },
      });

      return NextResponse.json({
        id: item.id, vendorId: item.vendorId, name: item.name,
        description: item.description, totalQuantity: item.totalQuantity,
        basePrice: Number(item.basePrice), unit: item.unit, imageUrl: item.imageUrl,
        availableQty: item.totalQuantity, allocatedQty: 0,
        createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(),
      }, { status: 201 });
    } catch (err) {
      console.error('[POST /api/vendor/[id]/inventory]', err);
      return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
    }
  },
  ['VENDOR', 'ADMIN']
);
