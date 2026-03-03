// src/app/api/live-events/[id]/incidents/[incidentId]/route.ts
// GET   /api/live-events/:id/incidents/:incidentId
// PATCH /api/live-events/:id/incidents/:incidentId — resolve or update

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type Params      = { id: string; incidentId: string };
type IncidentRow = { id: string; liveEventId: string; title: string; description: string | null; severity: string; reportedBy: string | null; resolvedAt: Date | null; createdAt: Date; updatedAt: Date };

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  const { id, incidentId } = await (ctx.params as unknown as Promise<Params>);
  try {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } }) as IncidentRow | null;
    if (!incident) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    if (incident.liveEventId !== id) return NextResponse.json({ error: 'Incident does not belong to this live event' }, { status: 403 });

    return NextResponse.json({ ...incident, createdAt: incident.createdAt.toISOString(), updatedAt: incident.updatedAt.toISOString(), resolvedAt: incident.resolvedAt?.toISOString() ?? null });
  } catch (err) {
    console.error('[GET incidents/[incidentId]]', err);
    return NextResponse.json({ error: 'Failed to fetch incident' }, { status: 500 });
  }
});

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  const { id, incidentId } = await (ctx.params as unknown as Promise<Params>);
  try {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } }) as IncidentRow | null;
    if (!incident) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    if (incident.liveEventId !== id) return NextResponse.json({ error: 'Incident does not belong to this live event' }, { status: 403 });

    const body = await req.json();
    const { action, severity, description } = body as { action?: string; severity?: string; description?: string };
    const updateData: Record<string, unknown> = {};

    if (action === 'resolve') {
      if (incident.resolvedAt) return NextResponse.json({ error: 'Incident is already resolved' }, { status: 422 });
      updateData.resolvedAt = new Date();
    }
    if (severity) {
      const VALID = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      if (!VALID.includes(severity.toUpperCase())) return NextResponse.json({ error: `severity must be one of: ${VALID.join(', ')}` }, { status: 400 });
      updateData.severity = severity.toUpperCase();
    }
    if (description !== undefined) updateData.description = description;

    const updated = await prisma.incident.update({ where: { id: incidentId }, data: updateData }) as IncidentRow;
    return NextResponse.json({ ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString(), resolvedAt: updated.resolvedAt?.toISOString() ?? null, message: action === 'resolve' ? 'Incident resolved' : 'Incident updated' });
  } catch (err) {
    console.error('[PATCH incidents/[incidentId]]', err);
    return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 });
  }
}, ['PLANNER', 'VENDOR', 'ADMIN']);
