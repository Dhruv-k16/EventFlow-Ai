// src/app/api/vendor/[id]/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { toUTCMidnight } from '@/lib/slotEngine';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const vendor = await prisma.vendor.findUnique({ where: { id }, select: { id: true } });
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    const blocks = await prisma.vendorAvailabilityBlock.findMany({
      where: { vendorId: id }, orderBy: { startDate: 'asc' },
    });
    return NextResponse.json(blocks.map(b => ({
      id: b.id, vendorId: b.vendorId,
      startDate: b.startDate.toISOString().split('T')[0],
      endDate:   b.endDate.toISOString().split('T')[0],
      reason: b.reason, createdAt: b.createdAt.toISOString(),
    })));
  } catch (err) {
    console.error('[GET /api/vendor/[id]/availability]', err);
    return NextResponse.json({ error: 'Failed to fetch availability blocks' }, { status: 500 });
  }
}

export const POST = withAuth<{ id: string }>(
  async (req, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
    if (user.role === 'VENDOR' && user.vendorId !== id)
      return NextResponse.json({ error: 'You can only manage your own availability' }, { status: 403 });
    try {
      const { startDate: s, endDate: e, reason } = await req.json();
      if (!s || !e) return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 });
      const startDate = toUTCMidnight(s);
      const endDate   = toUTCMidnight(e);
      if (startDate > endDate) return NextResponse.json({ error: 'startDate must be before endDate' }, { status: 400 });

      const conflicts = await prisma.booking.findMany({
        where: {
          vendorId: id, status: 'CONFIRMED',
          event: { startDate: { lte: endDate }, endDate: { gte: startDate } },
        },
        include: { event: { select: { name: true, startDate: true, endDate: true } } },
      });
      if (conflicts.length > 0) {
        return NextResponse.json({
          error: 'Cannot block these dates — confirmed bookings exist',
          conflicts: conflicts.map(b =>
            `"${b.event.name}" (${b.event.startDate.toISOString().split('T')[0]} – ${b.event.endDate.toISOString().split('T')[0]})`),
        }, { status: 409 });
      }

      const block = await prisma.vendorAvailabilityBlock.create({
        // FIX: VendorAvailabilityBlock has no @default(uuid()) — must supply id
        data: { id: crypto.randomUUID(), vendorId: id, startDate, endDate, reason: reason ?? null },
      });
      return NextResponse.json({
        id: block.id, vendorId: block.vendorId,
        startDate: block.startDate.toISOString().split('T')[0],
        endDate:   block.endDate.toISOString().split('T')[0],
        reason: block.reason, createdAt: block.createdAt.toISOString(),
      }, { status: 201 });
    } catch (err) {
      console.error('[POST /api/vendor/[id]/availability]', err);
      return NextResponse.json({ error: 'Failed to create block' }, { status: 500 });
    }
  },
  ['VENDOR', 'ADMIN']
);

export const DELETE = withAuth<{ id: string }>(
  async (req, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
    const blockId = new URL(req.url).searchParams.get('blockId');
    if (!blockId) return NextResponse.json({ error: 'blockId is required' }, { status: 400 });
    if (user.role === 'VENDOR' && user.vendorId !== id)
      return NextResponse.json({ error: 'You can only manage your own availability' }, { status: 403 });
    try {
      const block = await prisma.vendorAvailabilityBlock.findUnique({ where: { id: blockId } });
      if (!block) return NextResponse.json({ error: 'Block not found' }, { status: 404 });
      if (block.vendorId !== id) return NextResponse.json({ error: 'Block does not belong to this vendor' }, { status: 403 });
      await prisma.vendorAvailabilityBlock.delete({ where: { id: blockId } });
      return NextResponse.json({ success: true, deletedBlockId: blockId });
    } catch (err) {
      console.error('[DELETE /api/vendor/[id]/availability]', err);
      return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
    }
  },
  ['VENDOR', 'ADMIN']
);
