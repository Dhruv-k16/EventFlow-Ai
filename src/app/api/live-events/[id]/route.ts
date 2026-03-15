// src/app/api/live-events/[id]/route.ts
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type TaskRow     = { status: string; scheduledAt: Date; completedAt: Date | null; createdAt: Date; updatedAt: Date; [key: string]: unknown };
type IncidentRow = { resolvedAt: Date | null; severity: string; createdAt: Date; updatedAt: Date; [key: string]: unknown };

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  try {
    const le = await prisma.liveEvent.findUnique({
      where:   { id },
      include: {
        // FIX: were event/tasks — relation names are Event/LiveTask in schema
        Event:    { select: { id: true, name: true, startDate: true, endDate: true, location: true, guestCount: true } },
        LiveTask: { orderBy: { scheduledAt: 'asc' } },
      },
    });
    if (!le) return NextResponse.json({ error: 'Live event not found' }, { status: 404 });

    const incidents = await prisma.incident.findMany({
      where: { liveEventId: id }, orderBy: { createdAt: 'desc' },
    });

    // FIX: were le.tasks/le.event — now le.LiveTask/le.Event
    const tasks   = le.LiveTask as TaskRow[];
    const incRows = incidents as IncidentRow[];

    const taskStats = {
      total:         tasks.length,
      notStarted:    tasks.filter(t => t.status === 'NOT_STARTED').length,
      inProgress:    tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed:     tasks.filter(t => t.status === 'COMPLETED').length,
      delayed:       tasks.filter(t => t.status === 'DELAYED').length,
      completionPct: tasks.length > 0
        ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100) : 0,
    };
    const incidentStats = {
      total:    incRows.length,
      open:     incRows.filter(i => !i.resolvedAt).length,
      resolved: incRows.filter(i => !!i.resolvedAt).length,
      critical: incRows.filter(i => i.severity === 'CRITICAL' && !i.resolvedAt).length,
      high:     incRows.filter(i => i.severity === 'HIGH'     && !i.resolvedAt).length,
    };

    return NextResponse.json({
      id: le.id, eventId: le.eventId,
      event:       le.Event, // FIX: was le.event
      isActive:    le.isActive,
      startedAt:   le.startedAt.toISOString(),
      concludedAt: le.concludedAt?.toISOString() ?? null,
      taskStats, incidentStats,
      tasks:     tasks.map(t => ({ ...t, scheduledAt: t.scheduledAt.toISOString(), completedAt: t.completedAt?.toISOString() ?? null, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() })),
      incidents: incRows.map(i => ({ ...i, createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString(), resolvedAt: i.resolvedAt?.toISOString() ?? null })),
    });
  } catch (err) {
    console.error('[GET /api/live-events/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch live event' }, { status: 500 });
  }
});

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  try {
    const le = await prisma.liveEvent.findUnique({ where: { id } });
    if (!le) return NextResponse.json({ error: 'Live event not found' }, { status: 404 });
    const body = await req.json();
    if (body.action === 'conclude') {
      if (!le.isActive) return NextResponse.json({ error: 'Live event is already concluded' }, { status: 422 });
      const updated = await prisma.liveEvent.update({ where: { id }, data: { isActive: false, concludedAt: new Date() } });
      return NextResponse.json({ id: updated.id, isActive: updated.isActive, concludedAt: updated.concludedAt?.toISOString() ?? null, message: 'Live event concluded successfully' });
    }
    return NextResponse.json({ error: 'Invalid action. Supported: conclude' }, { status: 400 });
  } catch (err) {
    console.error('[PATCH /api/live-events/[id]]', err);
    return NextResponse.json({ error: 'Failed to update live event' }, { status: 500 });
  }
}, ['PLANNER', 'ADMIN']);
