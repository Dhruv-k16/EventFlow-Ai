// src/app/api/staff/assignments/[id]/route.ts
// GET    /api/staff/assignments/:id — get single assignment
// DELETE /api/staff/assignments/:id — remove a staff assignment

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(
  async (_req: NextRequest, ctx) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    try {
      const assignment = await prisma.staffAssignment.findUnique({
        where:   { id },
        include: {
          staff: { select: { id: true, name: true, role: true, vendorId: true } },
          event: { select: { id: true, name: true, startDate: true, endDate: true } },
        },
      });

      if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

      return NextResponse.json({
        id:        assignment.id,
        staffId:   assignment.staffId,
        eventId:   assignment.eventId,
        startTime: assignment.startTime.toISOString(),
        endTime:   assignment.endTime.toISOString(),
        staff:     assignment.staff,
        event: {
          id:        assignment.event.id,
          name:      assignment.event.name,
          startDate: assignment.event.startDate.toISOString().split('T')[0],
          endDate:   assignment.event.endDate.toISOString().split('T')[0],
        },
      });
    } catch (err) {
      console.error('[GET /api/staff/assignments/[id]]', err);
      return NextResponse.json({ error: 'Failed to fetch assignment' }, { status: 500 });
    }
  }
);

export const DELETE = withAuth(
  async (_req: NextRequest, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    try {
      const assignment = await prisma.staffAssignment.findUnique({
        where:   { id },
        include: { staff: { select: { vendorId: true, name: true } } },
      });

      if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

      // Vendors can only delete assignments for their own staff
      if (user.role === 'VENDOR' && assignment.staff.vendorId !== user.vendorId) {
        return NextResponse.json({ error: 'You can only manage your own staff assignments' }, { status: 403 });
      }

      await prisma.staffAssignment.delete({ where: { id } });

      return NextResponse.json({ success: true, deletedAssignmentId: id });
    } catch (err) {
      console.error('[DELETE /api/staff/assignments/[id]]', err);
      return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
    }
  },
  ['VENDOR', 'PLANNER', 'ADMIN']
);
