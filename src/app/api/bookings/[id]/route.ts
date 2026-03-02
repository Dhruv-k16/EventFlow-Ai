// src/app/api/bookings/[id]/route.ts
// PATCH /api/bookings/:id → advance booking through the SRS lifecycle
// GET   /api/bookings/:id → fetch single booking
//
// Inventory is ALLOCATED at → CONFIRMED
// Inventory is RELEASED  at CONFIRMED → CANCELLED

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  allocateInventory,
  checkInventoryAvailability,
  releaseInventory,
} from '@/lib/slotEngine';
import { BookingStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// SRS: strict transition table — no skipping
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
    const { status, rejectionReason } = body as {
      status: string;
      rejectionReason?: string;
    };

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where:   { id },
          include: { items: true, event: true },
        });

        if (!booking) throw new Error('BOOKING_NOT_FOUND');

        // ── Validate transition ────────────────────────────────────────────
        const allowed = VALID_TRANSITIONS[booking.status] ?? [];
        if (!allowed.includes(status as BookingStatus)) {
          throw new Error(`INVALID_TRANSITION:${booking.status}:${status}`);
        }

        // ── CONFIRMED: validate + allocate inventory ──────────────────────
        if (status === 'CONFIRMED') {
          const inventoryCheck = await checkInventoryAvailability(
            booking.items.map((i: { inventoryItemId: string; quantity: number }) => ({
              inventoryItemId: i.inventoryItemId,
              quantity:        i.quantity,
            })),
            booking.event.startDate,
            booking.event.endDate,
            tx as any
          );

          if (!inventoryCheck.available) {
            throw new Error(`INSUFFICIENT_STOCK:${inventoryCheck.conflicts.join(' | ')}`);
          }

          await allocateInventory(
            booking.items.map((i: { inventoryItemId: string; quantity: number }) => ({
              inventoryItemId: i.inventoryItemId,
              quantity:        i.quantity,
            })),
            booking.event.startDate,
            booking.event.endDate,
            tx as any
          );
        }

        // ── CANCELLED from CONFIRMED: release inventory ────────────────────
        if (status === 'CANCELLED' && booking.status === 'CONFIRMED') {
          await releaseInventory(
            booking.items.map((i: { inventoryItemId: string; quantity: number }) => ({
              inventoryItemId: i.inventoryItemId,
              quantity:        i.quantity,
            })),
            booking.event.startDate,
            booking.event.endDate,
            tx as any
          );
        }

        // ── Update booking record ──────────────────────────────────────────
        return tx.booking.update({
          where: { id },
          data: {
            status: status as BookingStatus,
            ...(rejectionReason ? { rejectionReason } : {}),
          },
          include: {
            items:    { include: { inventoryItem: true } },
            vendor:   true,
            event:    true,
            meetings: { orderBy: { phase: 'asc' } },
          },
        });
      });

      return NextResponse.json(result);
    } catch (err: any) {
      console.error('[PATCH /api/bookings/[id]]', err);

      if (err.message === 'BOOKING_NOT_FOUND') {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      if (err.message?.startsWith('INVALID_TRANSITION')) {
        const [, from, to] = err.message.split(':');
        return NextResponse.json(
          { error: `Cannot move booking from ${from} to ${to}` },
          { status: 422 }
        );
      }
      if (err.message?.startsWith('INSUFFICIENT_STOCK')) {
        const detail = err.message.replace('INSUFFICIENT_STOCK:', '');
        return NextResponse.json(
          { error: `Insufficient stock: ${detail}` },
          { status: 409 }
        );
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
        where:   { id },
        include: {
          items:    { include: { inventoryItem: true } },
          vendor:   true,
          event:    true,
          meetings: { orderBy: { phase: 'asc' } },
        },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      return NextResponse.json(booking);
    } catch (err) {
      console.error('[GET /api/bookings/[id]]', err);
      return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }
  }
);
