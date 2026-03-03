// src/app/api/live-events/[id]/incidents/route.ts
// GET  /api/live-events/:id/incidents — list incidents
// POST /api/live-events/:id/incidents — report incident

import { NextRequest, NextResponse } from 'next/server';
import { prisma }   from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

type IncidentRow = { id: string; liveEventId: string; title: string; description: string | null; severity: string; reportedBy: string | null; resolvedAt: Date | null; createdAt: Date; updatedAt: Date };

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  const { searchParams } = new URL(req.url);
  const severity = searchParams.get('severity');
  const openOnly = searchParams.get('open') === 'true';

  try {
    const le = await prisma.liveEvent.findUnique({ where: { id }, select: { id: true } });
    if (!le) return NextResponse.json({ error: 'Live event not found' }, { status: 404 });

    const incidents = await prisma.incident.findMany({
      where: {
        liveEventId: id,
        ...(severity ? { severity } : {}),
        ...(openOnly ? { resolvedAt: null } : {}),
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    }) as IncidentRow[];

    return NextResponse.json(incidents.map(i => ({
      ...i,
      createdAt:  i.createdAt.toISOString(),
      updatedAt:  i.updatedAt.toISOString(),
      resolvedAt: i.resolvedAt?.toISOString() ?? null,
    })));
  } catch (err) {
    console.error('[GET /api/live-events/[id]/incidents]', err);
    return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  try {
    const le = await prisma.liveEvent.findUnique({ where: { id }, select: { id: true, isActive: true } });
    if (!le) return NextResponse.json({ error: 'Live event not found' }, { status: 404 });
    if (!le.isActive) return NextResponse.json({ error: 'Cannot report incidents on a concluded event' }, { status: 422 });

    const body = await req.json();
    const { title, description, severity, reportedBy } = body as { title: string; description?: string; severity?: string; reportedBy?: string };

    if (!title?.trim())
      return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const sev = severity?.toUpperCase() ?? 'LOW';
    if (!VALID_SEVERITIES.includes(sev))
      return NextResponse.json({ error: `severity must be one of: ${VALID_SEVERITIES.join(', ')}` }, { status: 400 });

    const incident = await prisma.incident.create({
      data: { liveEventId: id, title: title.trim(), description: description?.trim() ?? null, severity: sev, reportedBy: reportedBy ?? null },
    }) as IncidentRow;

    return NextResponse.json({ ...incident, createdAt: incident.createdAt.toISOString(), updatedAt: incident.updatedAt.toISOString(), resolvedAt: null }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/live-events/[id]/incidents]', err);
    return NextResponse.json({ error: 'Failed to report incident' }, { status: 500 });
  }
}, ['PLANNER', 'VENDOR', 'ADMIN']);
