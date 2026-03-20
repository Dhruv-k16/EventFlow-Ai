// src/app/api/planner/staff/[staffId]/assignments/route.ts
// GET  /api/planner/staff/:staffId/assignments  → list events assigned to this staff member
// POST /api/planner/staff/:staffId/assignments  → assign staff member to an event

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Verify ownership — staff must belong to the requesting planner
async function getOwnedStaff(staffId: string, userId: string) {
  const planner = await prisma.plannerProfile.findUnique({
    where: { userId }, select: { id: true },
  });
  if (!planner) return null;
  return prisma.plannerStaff.findFirst({
    where: { id: staffId, plannerProfileId: planner.id },
  });
}

// ── GET ───────────────────────────────────────────────────────────────────────
export const GET = withAuth(
  async (_req: NextRequest, ctx, user) => {
    const { staffId } = await (ctx.params as unknown as Promise<{ staffId: string }>);
    try {
      const staff = await getOwnedStaff(staffId, user.sub);
      if (!staff) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });

      const assignments = await prisma.plannerStaffAssignment.findMany({
        where: { staffId },
        include: {
          event: {
            select: {
              id: true, name: true, eventType: true, startDate: true,
              endDate: true, location: true, venueName: true, type: true,
            },
          },
        },
        orderBy: { event: { startDate: 'asc' } },
      });

      return NextResponse.json({
        staffId,
        staffName: staff.name,
        total: assignments.length,
        assignments: assignments.map(a => ({
          id:        a.id,
          task:      a.task,
          notes:     a.notes,
          assignedAt: a.createdAt.toISOString(),
          event: {
            id:        a.event.id,
            name:      a.event.name,
            eventType: a.event.eventType,
            startDate: a.event.startDate.toISOString(),
            endDate:   a.event.endDate.toISOString(),
            location:  a.event.location,
            venueName: a.event.venueName,
            type:      a.event.type,
          },
        })),
      });
    } catch (err) {
      console.error('[GET /api/planner/staff/:staffId/assignments]', err);
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }
  },
  ['PLANNER', 'ADMIN']
);

// ── POST — assign to event ─────────────────────────────────────────────────
export const POST = withAuth(
  async (req: NextRequest, ctx, user) => {
    const { staffId } = await (ctx.params as unknown as Promise<{ staffId: string }>);
    try {
      const staff = await getOwnedStaff(staffId, user.sub);
      if (!staff) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });

      const body = await req.json();
      const { eventId, task, notes } = body as { eventId: string; task?: string; notes?: string };
      if (!eventId) return NextResponse.json({ error: 'eventId is required' }, { status: 400 });

      // Verify the event belongs to this planner
      const planner = await prisma.plannerProfile.findUnique({ where: { userId: user.sub }, select: { id: true } });
      const event   = await prisma.event.findFirst({ where: { id: eventId, plannerId: planner?.id } });
      if (!event) return NextResponse.json({ error: 'Event not found or not yours' }, { status: 404 });

      // Upsert — re-assigning same staff/event just updates task
      const assignment = await prisma.plannerStaffAssignment.upsert({
        where:  { staffId_eventId: { staffId, eventId } },
        update: { task: task ?? null, notes: notes ?? null },
        create: { staffId, eventId, task: task ?? null, notes: notes ?? null },
        include: {
          event: { select: { id: true, name: true, eventType: true, startDate: true, location: true } },
        },
      });

      // Update assignedEvents counter
      const count = await prisma.plannerStaffAssignment.count({ where: { staffId } });
      await prisma.plannerStaff.update({ where: { id: staffId }, data: { assignedEvents: count } });

      return NextResponse.json({
        id:         assignment.id,
        task:       assignment.task,
        notes:      assignment.notes,
        assignedAt: assignment.createdAt.toISOString(),
        event: {
          id:        assignment.event.id,
          name:      assignment.event.name,
          eventType: assignment.event.eventType,
          startDate: assignment.event.startDate.toISOString(),
          location:  assignment.event.location,
        },
      }, { status: 201 });
    } catch (err: any) {
      if (err.code === 'P2002') {
        return NextResponse.json({ error: 'Already assigned to this event' }, { status: 409 });
      }
      console.error('[POST /api/planner/staff/:staffId/assignments]', err);
      return NextResponse.json({ error: 'Failed to assign staff' }, { status: 500 });
    }
  },
  ['PLANNER', 'ADMIN']
);
