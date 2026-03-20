// src/app/api/events/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        functions: {
          // FIX: was date — now startDate
          orderBy: { startDate: 'asc' },
          include: {
            bookings: {
              include: {
                vendor: { select: { id: true, businessName: true, category: true, avatarUrl: true } },
              },
            },
            _count: { select: { bookings: true } },
          },
        },
        bookings: {
          include: {
            vendor: { select: { id: true, businessName: true, category: true, avatarUrl: true, rating: true } },
            items:  { include: { inventoryItem: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        parent: { select: { id: true, name: true, type: true } },
        // FIX: planner is PlannerProfile — it only has id, businessName, bio etc. NOT firstName/lastName
        planner: { select: { id: true, businessName: true } },
        client:  { select: { id: true, firstName: true, lastName: true, email: true } },
        _count:  { select: { functions: true, bookings: true } },
      },
    });

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    console.error('[GET /api/events/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await req.json();
    const {
      name, eventType, description,
      startDate, endDate,   // FIX: was date/endDate — use schema field names directly
      time, location, venueName,
      guestCount, totalBudget, allocatedBudget,
    } = body;

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(name            !== undefined && { name }),
        ...(eventType       !== undefined && { eventType }),
        ...(description     !== undefined && { description }),
        // FIX: startDate/endDate are required non-null — only update if defined and non-null
        ...(startDate       !== undefined && startDate !== null && { startDate: new Date(startDate) }),
        ...(endDate         !== undefined && endDate   !== null && { endDate:   new Date(endDate)   }),
        ...(time            !== undefined && { time }),
        ...(location        !== undefined && { location }),
        ...(venueName       !== undefined && { venueName }),
        ...(guestCount      !== undefined && { guestCount:      guestCount      ? parseInt(guestCount)        : null }),
        ...(totalBudget     !== undefined && { totalBudget:     totalBudget     ? parseFloat(totalBudget)     : null }),
        ...(allocatedBudget !== undefined && { allocatedBudget: allocatedBudget ? parseFloat(allocatedBudget) : null }),
      },
      include: {
        functions: { orderBy: { startDate: 'asc' } }, // FIX: was date
        _count:    { select: { functions: true, bookings: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/events/:id]', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id }, select: { id: true },
    });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const confirmedBookings = await prisma.booking.count({
      where: { eventId: id, status: 'CONFIRMED' },
    });
    if (confirmedBookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete an event with confirmed bookings. Cancel bookings first.' },
        { status: 409 }
      );
    }

    // Collect all event IDs to delete (parent + all sub-events)
    const subEventIds = (await prisma.event.findMany({
      where: { parentId: id },
      select: { id: true },
    })).map(e => e.id);

    const allIds = [id, ...subEventIds];

    const bookingIds = (await prisma.booking.findMany({
      where: { eventId: { in: allIds } },
      select: { id: true },
    })).map(b => b.id);

    const liveEventIds = (await prisma.liveEvent.findMany({
      where: { eventId: { in: allIds } },
      select: { id: true },
    })).map(l => l.id);

    await prisma.$transaction([
      prisma.bookingItem.deleteMany({ where: { bookingId: { in: bookingIds } } }),
      prisma.meetingRecord.deleteMany({ where: { bookingId: { in: bookingIds } } }),
      prisma.booking.deleteMany({ where: { id: { in: bookingIds } } }),
      prisma.plannerStaffAssignment.deleteMany({ where: { eventId: { in: allIds } } }),
      prisma.liveTask.deleteMany({ where: { liveEventId: { in: liveEventIds } } }),
      prisma.incident.deleteMany({ where: { liveEventId: { in: liveEventIds } } }),
      prisma.liveEvent.deleteMany({ where: { id: { in: liveEventIds } } }),
      prisma.financialSummary.deleteMany({ where: { eventId: { in: allIds } } }),
      prisma.event.deleteMany({ where: { parentId: id } }),
      prisma.event.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/events/:id]', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
