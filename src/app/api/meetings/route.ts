// src/app/api/meetings/route.ts
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
  try {
    const body = await req.json();
    const { bookingId, phase, scheduledAt, meetingLink, notes } = body as {
      bookingId: string; phase: number; scheduledAt: string; meetingLink?: string; notes?: string;
    };

    if (!bookingId || !phase || !scheduledAt) {
      return NextResponse.json({ error: 'bookingId, phase, and scheduledAt are required' }, { status: 400 });
    }
    if (phase !== 1 && phase !== 2) {
      return NextResponse.json({ error: 'phase must be 1 or 2' }, { status: 400 });
    }
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledAt datetime' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where:   { id: bookingId },
      // FIX: was meetings — relation name is MeetingRecord in schema
      include: { MeetingRecord: { orderBy: { phase: 'asc' } } },
    });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (user.role === 'VENDOR' && booking.vendorId !== user.vendorId) {
      return NextResponse.json({ error: 'You can only schedule meetings for your own bookings' }, { status: 403 });
    }

    if (phase === 1 && booking.status !== 'REQUESTED') {
      return NextResponse.json({ error: `Phase 1 meeting can only be scheduled when booking is REQUESTED. Current: ${booking.status}` }, { status: 422 });
    }
    if (phase === 2 && booking.status !== 'CONFIRMATION_PENDING') {
      return NextResponse.json({ error: `Phase 2 meeting can only be scheduled when booking is CONFIRMATION_PENDING. Current: ${booking.status}` }, { status: 422 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const meeting = await tx.meetingRecord.create({
        data: {
          // FIX: MeetingRecord has no @default(uuid()) — must supply id + updatedAt
          id:          crypto.randomUUID(),
          updatedAt:   new Date(),
          bookingId,
          phase,
          status:      'SCHEDULED',
          scheduledAt: scheduledDate,
          meetingLink: meetingLink ?? null,
          notes:       notes ?? null,
        },
      });

      const nextStatus: BookingStatus = phase === 1 ? 'MEETING_PHASE_1' : 'MEETING_PHASE_2';
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId }, data: { status: nextStatus },
      });

      return { meeting, bookingStatus: updatedBooking.status };
    });

    return NextResponse.json({
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
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/meetings]', err);
    return NextResponse.json({ error: 'Failed to schedule meeting' }, { status: 500 });
  }
}, ['VENDOR', 'PLANNER', 'ADMIN']);

export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    if (!bookingId) return NextResponse.json({ error: 'bookingId query param is required' }, { status: 400 });

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (user.role === 'VENDOR' && booking.vendorId !== user.vendorId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const meetings = await prisma.meetingRecord.findMany({
      where: { bookingId }, orderBy: { phase: 'asc' },
    });

    return NextResponse.json(meetings.map(m => ({
      id: m.id, bookingId: m.bookingId, phase: m.phase, status: m.status,
      scheduledAt: m.scheduledAt.toISOString(),
      completedAt: m.completedAt?.toISOString() ?? null,
      meetingLink: m.meetingLink, notes: m.notes,
      createdAt: m.createdAt.toISOString(), updatedAt: m.updatedAt.toISOString(),
    })));
  } catch (err) {
    console.error('[GET /api/meetings]', err);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}, ['VENDOR', 'PLANNER', 'CLIENT', 'ADMIN']);
