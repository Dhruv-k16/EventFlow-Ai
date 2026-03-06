// src/app/api/vendors/[id]/inventory/[itemId]/variants/[vid]/route.ts
// PATCH  — update a single variant
// DELETE — delete a single variant

import { NextRequest, NextResponse } from 'next/server';
import { prisma }   from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

type Params = { id: string; itemId: string; vid: string };

async function syncParentQty(itemId: string) {
  const agg = await prisma.inventoryVariant.aggregate({
    where: { itemId }, _sum: { totalQuantity: true },
  });
  const count = await prisma.inventoryVariant.count({ where: { itemId } });
  await prisma.inventoryItem.update({
    where: { id: itemId },
    data:  { totalQuantity: agg._sum.totalQuantity ?? 0, hasVariants: count > 0 },
  });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────
export const PATCH = withAuth<Params>(
  async (req, { params }, user) => {
    const { id, itemId, vid } = params;

    const variant = await prisma.inventoryVariant.findUnique({
      where: { id: vid }, include: { item: { select: { vendorId: true } } },
    });
    if (!variant) return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    if (user.role === 'VENDOR' && variant.item.vendorId !== id)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    try {
      const body = await req.json() as {
        name?: string; sku?: string; totalQuantity?: number;
        priceOverride?: number | null; color?: string | null;
        material?: string | null; dimensions?: string | null;
        attributes?: Record<string, unknown> | null; imageUrl?: string | null;
      };

      const data: Record<string, unknown> = {};
      if (body.name          !== undefined) data.name          = body.name.trim();
      if (body.sku           !== undefined) data.sku           = body.sku?.trim() ?? null;
      if (body.totalQuantity !== undefined) data.totalQuantity = body.totalQuantity;
      if (body.priceOverride !== undefined) data.priceOverride = body.priceOverride;
      if (body.color         !== undefined) data.color         = body.color;
      if (body.material      !== undefined) data.material      = body.material;
      if (body.dimensions    !== undefined) data.dimensions    = body.dimensions;
      if (body.attributes    !== undefined) data.attributes    = body.attributes as import('@prisma/client').Prisma.InputJsonValue | null;
      if (body.imageUrl      !== undefined) data.imageUrl      = body.imageUrl;

      const updated = await prisma.inventoryVariant.update({ where: { id: vid }, data });
      await syncParentQty(itemId);

      return NextResponse.json(updated);
    } catch (err) {
      console.error('[PATCH variant]', err);
      return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 });
    }
  },
  ['VENDOR', 'ADMIN']
);

// ── DELETE ────────────────────────────────────────────────────────────────────
export const DELETE = withAuth<Params>(
  async (_req, { params }, user) => {
    const { id, itemId, vid } = params;

    const variant = await prisma.inventoryVariant.findUnique({
      where: { id: vid }, include: { item: { select: { vendorId: true } } },
    });
    if (!variant) return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    if (user.role === 'VENDOR' && variant.item.vendorId !== id)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    // Block delete if variant has active bookings
    const activeBookings = await prisma.bookingItem.count({
      where: { variantId: vid, booking: { status: { in: ['CONFIRMED', 'REQUESTED', 'CONFIRMATION_PENDING', 'MEETING_PHASE_1', 'MEETING_PHASE_2'] as import('@prisma/client').BookingStatus[] } } },
    });
    if (activeBookings > 0)
      return NextResponse.json(
        { error: `Cannot delete — ${activeBookings} active booking(s) reference this variant` },
        { status: 409 }
      );

    await prisma.variantAvailability.deleteMany({ where: { variantId: vid } });
    await prisma.inventoryVariant.delete({ where: { id: vid } });
    await syncParentQty(itemId);

    return NextResponse.json({ deleted: vid, itemId });
  },
  ['VENDOR', 'ADMIN']
);
