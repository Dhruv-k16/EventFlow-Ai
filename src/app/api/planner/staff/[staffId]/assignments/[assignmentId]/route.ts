// src/app/api/planner/staff/[staffId]/assignments/[assignmentId]/route.ts
// DELETE /api/planner/staff/:staffId/assignments/:assignmentId → unassign from event

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const DELETE = withAuth(
  async (_req: NextRequest, ctx, user) => {
    const { staffId, assignmentId } = await (ctx.params as unknown as Promise<{ staffId: string; assignmentId: string }>);
    try {
      // Verify ownership
      const planner = await prisma.plannerProfile.findUnique({ where: { userId: user.sub }, select: { id: true } });
      const staff   = await prisma.plannerStaff.findFirst({ where: { id: staffId, plannerProfileId: planner?.id ?? '' } });
      if (!staff) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });

      const assignment = await prisma.plannerStaffAssignment.findFirst({
        where: { id: assignmentId, staffId },
      });
      if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

      await prisma.plannerStaffAssignment.delete({ where: { id: assignmentId } });

      // Update counter
      const count = await prisma.plannerStaffAssignment.count({ where: { staffId } });
      await prisma.plannerStaff.update({ where: { id: staffId }, data: { assignedEvents: count } });

      return NextResponse.json({ success: true, deletedId: assignmentId });
    } catch (err) {
      console.error('[DELETE /api/planner/staff/:staffId/assignments/:assignmentId]', err);
      return NextResponse.json({ error: 'Failed to remove assignment' }, { status: 500 });
    }
  },
  ['PLANNER', 'ADMIN']
);
