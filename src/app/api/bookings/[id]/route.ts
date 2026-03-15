// src/app/api/bookings/[id]/route.ts
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { allocateInventory, checkInventoryAvailability, releaseInventory } from '@/lib/slotEngine';
import { BookingStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const VALID_TRANSITIONS: Record<string, BookingStatus[]> = {
  REQUESTED:            ['MEETING_PHASE_1', 'CONFIRMATION_PENDING', 'CANCELLED'],
  MEETING_PHASE_1:      ['CONFIRMATION_PENDING', 'CANCELLED'],
  CONFIRMATION_PENDING: ['MEETING_PHASE_2', 'CONFIRMED', 'REJECTED_CAPACITY', 'CANCELLED'],
  MEETING_PHASE_2:      ['CONFIRMED', 'REJECTED_CAPACITY', 'CANCELLED'],
  CONFIRMED:            ['COMPLETED', 'CANCELLED'],
  REJECTED_CAPACITY:    [],
  CANCELLED:            [],
  COMPLETED:            [],
};

export const PATCH = withAuth(
  async (req: NextRequest, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
    const body = await req.json();
    const { status, rejectionReason } = body as { status: string; rejectionReason?: string };

    if (!status) return NextResponse.json({ error: 'status is required' }, { status: 400 });

    try {
      const result = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id }, include: { items: true, event: true },
        });
        if (!booking) throw new Error('BOOKING_NOT_FOUND');

        const allowed = VALID_TRANSITIONS[booking.status] ?? [];
        if (!allowed.includes(status as BookingStatus)) {
          throw new Error(`INVALID_TRANSITION:${booking.status}:${status}`);
        }

        if (status === 'CONFIRMED') {
          const inventoryCheck = await checkInventoryAvailability(
            booking.items.map((i: { inventoryItemId: string; quantity: number }) => ({ inventoryItemId: i.inventoryItemId, quantity: i.quantity })),
            booking.event.startDate, booking.event.endDate, tx as any
          );
          if (!inventoryCheck.available) throw new Error(`INSUFFICIENT_STOCK:${inventoryCheck.conflicts.join(' | ')}`);
          await allocateInventory(
            booking.items.map((i: { inventoryItemId: string; quantity: number }) => ({ inventoryItemId: i.inventoryItemId, quantity: i.quantity })),
            booking.event.startDate, booking.event.endDate, tx as any
          );
        }

        if (status === 'CANCELLED' && booking.status === 'CONFIRMED') {
          await releaseInventory(
            booking.items.map((i: { inventoryItemId: string; quantity: number }) => ({ inventoryItemId: i.inventoryItemId, quantity: i.quantity })),
            booking.event.startDate, booking.event.endDate, tx as any
          );
        }

        return tx.booking.update({
          where: { id },
          data:  { status: status as BookingStatus, ...(rejectionReason ? { rejectionReason } : {}) },
          include: {
            items:        { include: { inventoryItem: true } },
            vendor:       true,
            event:        true,
            MeetingRecord: { orderBy: { phase: 'asc' } }, // FIX: was meetings
          },
        });
      });

      return NextResponse.json(result);
    } catch (err: any) {
      console.error('[PATCH /api/bookings/[id]]', err);
      if (err.message === 'BOOKING_NOT_FOUND') return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      if (err.message?.startsWith('INVALID_TRANSITION')) {
        const [, from, to] = err.message.split(':');
        return NextResponse.json({ error: `Cannot move booking from ${from} to ${to}` }, { status: 422 });
      }
      if (err.message?.startsWith('INSUFFICIENT_STOCK')) {
        return NextResponse.json({ error: `Insufficient stock: ${err.message.replace('INSUFFICIENT_STOCK:', '')}` }, { status: 409 });
      }
      return NextResponse.json({ error: 'Status update failed' }, { status: 500 });
    }
  },
  ['VENDOR', 'PLANNER', 'ADMIN']
);

export const GET = withAuth(
  async (_req: NextRequest, ctx) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          items:        { include: { inventoryItem: true } },
          vendor:       true,
          event:        true,
          MeetingRecord: { orderBy: { phase: 'asc' } }, // FIX: was meetings
        },
      });
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      return NextResponse.json(booking);
    } catch (err) {
      console.error('[GET /api/bookings/[id]]', err);
      return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }
  }
);
