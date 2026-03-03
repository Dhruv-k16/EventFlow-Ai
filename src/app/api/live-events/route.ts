// src/app/api/live-events/route.ts
// POST /api/live-events          — activate a live event
// GET  /api/live-events?eventId= — get live event(s)

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');

  try {
    const liveEvents = await prisma.liveEvent.findMany({
      where:   eventId ? { eventId } : {},
      include: {
        event:  { select: { id: true, name: true, startDate: true, endDate: true, location: true } },
        tasks:  { orderBy: { scheduledAt: 'asc' } },
      },
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json(liveEvents.map(le => ({
      id:          le.id,
      eventId:     le.eventId,
      event:       le.event,
      isActive:    le.isActive,
      startedAt:   le.startedAt.toISOString(),
      concludedAt: le.concludedAt?.toISOString() ?? null,
      taskCount:            le.tasks.length,
      completedTaskCount:   le.tasks.filter((t: { status: string }) => t.status === 'COMPLETED').length,
      delayedTaskCount:     le.tasks.filter((t: { status: string }) => t.status === 'DELAYED').length,
      tasks:                le.tasks,
    })));
  } catch (err) {
    console.error('[GET /api/live-events]', err);
    return NextResponse.json({ error: 'Failed to fetch live events' }, { status: 500 });
  }
}, ['PLANNER', 'VENDOR', 'ADMIN']);

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const { eventId } = await req.json() as { eventId: string };

    if (!eventId)
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });

    const event = await prisma.event.findUnique({
      where:  { id: eventId },
      select: { id: true, name: true, startDate: true, endDate: true },
    });
    if (!event)
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const existing = await prisma.liveEvent.findUnique({ where: { eventId } });
    if (existing)
      return NextResponse.json(
        { error: 'A live session already exists for this event', liveEventId: existing.id },
        { status: 409 }
      );

    const liveEvent = await prisma.liveEvent.create({
      data:    { eventId, isActive: true },
      include: { event: { select: { id: true, name: true, startDate: true, endDate: true, location: true } } },
    });

    return NextResponse.json({
      id:        liveEvent.id,
      eventId:   liveEvent.eventId,
      event:     liveEvent.event,
      isActive:  liveEvent.isActive,
      startedAt: liveEvent.startedAt.toISOString(),
      tasks:     [],
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/live-events]', err);
    return NextResponse.json({ error: 'Failed to activate live event' }, { status: 500 });
  }
}, ['PLANNER', 'ADMIN']);
