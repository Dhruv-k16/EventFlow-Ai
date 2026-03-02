// src/app/api/meetings/route.ts
// POST /api/meetings — schedule a Phase 1 or Phase 2 meeting for a booking
// GET  /api/meetings?bookingId=X — list meetings for a booking
//
// SRS lifecycle auto-advance on scheduling:
//   Phase 1 scheduled → booking moves REQUESTED → MEETING_PHASE_1
//   Phase 2 scheduled → booking moves CONFIRMATION_PENDING → MEETING_PHASE_2
//
// Only VENDOR or PLANNER can schedule meetings.
// Vendors can only schedule meetings for their own bookings.

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
  try {
    const body = await req.json();
    const { bookingId, phase, scheduledAt, meetingLink, notes } = body as {
      bookingId:    string;
      phase:        number;     // 1 or 2
      scheduledAt:  string;     // ISO datetime
      meetingLink?: string;
      notes?:       string;
    };

    // ── Validate ─────────────────────────────────────────────────────────
    if (!bookingId || !phase || !scheduledAt) {
      return NextResponse.json(
        { error: 'bookingId, phase, and scheduledAt are required' },
        { status: 400 }
      );
    }

    if (phase !== 1 && phase !== 2) {
      return NextResponse.json(
        { error: 'phase must be 1 or 2' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledAt datetime' }, { status: 400 });
    }

    // ── Load booking ──────────────────────────────────────────────────────
    const booking = await prisma.booking.findUnique({
      where:   { id: bookingId },
      include: { meetings: { orderBy: { phase: 'asc' } } },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // ── Ownership check ───────────────────────────────────────────────────
    if (user.role === 'VENDOR' && booking.vendorId !== user.vendorId) {
      return NextResponse.json(
        { error: 'You can only schedule meetings for your own bookings' },
        { status: 403 }
      );
    }

    // ── SRS: validate correct booking status for each phase ───────────────
    if (phase === 1) {
      if (booking.status !== 'REQUESTED') {
        return NextResponse.json(
          {
            error: `Phase 1 meeting can only be scheduled when booking is REQUESTED. Current status: ${booking.status}`,
          },
          { status: 422 }
        );
      }
    }

    if (phase === 2) {
      if (booking.status !== 'CONFIRMATION_PENDING') {
        return NextResponse.json(
          {
            error: `Phase 2 meeting can only be scheduled when booking is CONFIRMATION_PENDING. Current status: ${booking.status}`,
          },
          { status: 422 }
        );
      }
    }

    // ── Create meeting + advance booking status in transaction ────────────
    const result = await prisma.$transaction(async (tx) => {
      const meeting = await tx.meetingRecord.create({
        data: {
          bookingId,
          phase,
          status:      'SCHEDULED',
          scheduledAt: scheduledDate,
          meetingLink: meetingLink ?? null,
          notes:       notes ?? null,
        },
      });

      // SRS auto-advance:
      //   Phase 1 scheduled → REQUESTED → MEETING_PHASE_1
      //   Phase 2 scheduled → CONFIRMATION_PENDING → MEETING_PHASE_2
      const nextStatus: BookingStatus = phase === 1
        ? 'MEETING_PHASE_1'
        : 'MEETING_PHASE_2';

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data:  { status: nextStatus },
      });

      return { meeting, bookingStatus: updatedBooking.status };
    });

    return NextResponse.json(
      {
        meeting: {
          id:          result.meeting.id,
          bookingId:   result.meeting.bookingId,
          phase:       result.meeting.phase,
          status:      result.meeting.status,
          scheduledAt: result.meeting.scheduledAt.toISOString(),
          meetingLink: result.meeting.meetingLink,
          notes:       result.meeting.notes,
          createdAt:   result.meeting.createdAt.toISOString(),
        },
        bookingStatus: result.bookingStatus,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/meetings]', err);
    return NextResponse.json({ error: 'Failed to schedule meeting' }, { status: 500 });
  }
}, ['VENDOR', 'PLANNER', 'ADMIN']);

export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId query param is required' },
        { status: 400 }
      );
    }

    // Verify booking exists + access
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (user.role === 'VENDOR' && booking.vendorId !== user.vendorId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const meetings = await prisma.meetingRecord.findMany({
      where:   { bookingId },
      orderBy: { phase: 'asc' },
    });

    return NextResponse.json(
      meetings.map(m => ({
        id:          m.id,
        bookingId:   m.bookingId,
        phase:       m.phase,
        status:      m.status,
        scheduledAt: m.scheduledAt.toISOString(),
        completedAt: m.completedAt?.toISOString() ?? null,
        meetingLink: m.meetingLink,
        notes:       m.notes,
        createdAt:   m.createdAt.toISOString(),
        updatedAt:   m.updatedAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error('[GET /api/meetings]', err);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}, ['VENDOR', 'PLANNER', 'CLIENT', 'ADMIN']);
