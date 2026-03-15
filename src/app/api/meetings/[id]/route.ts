// src/app/api/meetings/[id]/route.ts
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { allocateInventory, checkInventoryAvailability } from '@/lib/slotEngine';
import { MeetingStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const VALID_MEETING_TRANSITIONS: Record<string, MeetingStatus[]> = {
  SCHEDULED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: ['SCHEDULED'],
  NO_SHOW:   ['SCHEDULED'],
};

export const GET = withAuth(
  async (_req: NextRequest, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
    try {
      const meeting = await prisma.meetingRecord.findUnique({
        where:   { id },
        // FIX: was booking — relation name is Booking (PascalCase) in schema
        include: { Booking: { select: { vendorId: true, eventId: true, status: true } } },
      });
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

      // FIX: was meeting.booking — now meeting.Booking
      if (user.role === 'VENDOR' && meeting.Booking.vendorId !== user.vendorId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      return NextResponse.json({
        id: meeting.id, bookingId: meeting.bookingId,
        phase: meeting.phase, status: meeting.status,
        scheduledAt: meeting.scheduledAt.toISOString(),
        completedAt: meeting.completedAt?.toISOString() ?? null,
        meetingLink: meeting.meetingLink, notes: meeting.notes,
        bookingStatus: meeting.Booking.status, // FIX: was meeting.booking
        createdAt: meeting.createdAt.toISOString(), updatedAt: meeting.updatedAt.toISOString(),
      });
    } catch (err) {
      console.error('[GET /api/meetings/[id]]', err);
      return NextResponse.json({ error: 'Failed to fetch meeting' }, { status: 500 });
    }
  }
);

export const PATCH = withAuth(
  async (req: NextRequest, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
    try {
      const body = await req.json();
      const { status: newStatus, notes, meetingLink, scheduledAt } = body as {
        status: string; notes?: string; meetingLink?: string; scheduledAt?: string;
      };

      if (!newStatus) return NextResponse.json({ error: 'status is required' }, { status: 400 });

      const meeting = await prisma.meetingRecord.findUnique({
        where:   { id },
        // FIX: was booking — now Booking
        include: {
          Booking: {
            include: {
              items: { select: { inventoryItemId: true, quantity: true } },
              event: { select: { id: true, startDate: true, endDate: true } },
            },
          },
        },
      });
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

      // FIX: was meeting.booking — now meeting.Booking
      if (user.role === 'VENDOR' && meeting.Booking.vendorId !== user.vendorId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const allowed = VALID_MEETING_TRANSITIONS[meeting.status] ?? [];
      if (!allowed.includes(newStatus as MeetingStatus)) {
        return NextResponse.json({ error: `Cannot change meeting from ${meeting.status} to ${newStatus}` }, { status: 422 });
      }

      const result = await prisma.$transaction(async (tx) => {
        const meetingUpdateData: Record<string, unknown> = { status: newStatus as MeetingStatus };
        if (notes       !== undefined) meetingUpdateData.notes       = notes;
        if (meetingLink !== undefined) meetingUpdateData.meetingLink = meetingLink;
        if (newStatus === 'COMPLETED') meetingUpdateData.completedAt = new Date();
        if (newStatus === 'SCHEDULED' && scheduledAt) {
          const rescheduleDate = new Date(scheduledAt);
          if (isNaN(rescheduleDate.getTime())) throw new Error('INVALID_DATE');
          meetingUpdateData.scheduledAt = rescheduleDate;
          meetingUpdateData.completedAt = null;
        }

        const updatedMeeting = await tx.meetingRecord.update({ where: { id }, data: meetingUpdateData });
        let newBookingStatus: string | null = null;

        if (newStatus === 'COMPLETED') {
          // FIX: was meeting.booking — now meeting.Booking
          const booking = meeting.Booking;

          if (meeting.phase === 1 && booking.status === 'MEETING_PHASE_1') {
            await tx.booking.update({ where: { id: booking.id }, data: { status: 'CONFIRMATION_PENDING' } });
            newBookingStatus = 'CONFIRMATION_PENDING';
          }

          if (meeting.phase === 2 && booking.status === 'MEETING_PHASE_2') {
            const inventoryItems = booking.items.map((i: { inventoryItemId: string; quantity: number }) => ({
              inventoryItemId: i.inventoryItemId, quantity: i.quantity,
            }));
            const inventoryCheck = await checkInventoryAvailability(inventoryItems, booking.event.startDate, booking.event.endDate, tx as any);
            if (!inventoryCheck.available) throw new Error(`INSUFFICIENT_STOCK:${inventoryCheck.conflicts.join(' | ')}`);
            await allocateInventory(inventoryItems, booking.event.startDate, booking.event.endDate, tx as any);
            await tx.booking.update({ where: { id: booking.id }, data: { status: 'CONFIRMED' } });
            newBookingStatus = 'CONFIRMED';
          }
        }

        return { meeting: updatedMeeting, newBookingStatus };
      });

      return NextResponse.json({
        meeting: {
          id: result.meeting.id, bookingId: result.meeting.bookingId,
          phase: result.meeting.phase, status: result.meeting.status,
          scheduledAt: result.meeting.scheduledAt.toISOString(),
          completedAt: result.meeting.completedAt?.toISOString() ?? null,
          meetingLink: result.meeting.meetingLink, notes: result.meeting.notes,
          updatedAt: result.meeting.updatedAt.toISOString(),
        },
        ...(result.newBookingStatus ? { bookingAdvancedTo: result.newBookingStatus } : {}),
      });
    } catch (err: any) {
      console.error('[PATCH /api/meetings/[id]]', err);
      if (err.message === 'INVALID_DATE') return NextResponse.json({ error: 'Invalid scheduledAt date' }, { status: 400 });
      if (err.message?.startsWith('INSUFFICIENT_STOCK')) {
        return NextResponse.json({ error: `Cannot confirm booking — insufficient stock: ${err.message.replace('INSUFFICIENT_STOCK:', '')}` }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
    }
  },
  ['VENDOR', 'PLANNER', 'ADMIN']
);
