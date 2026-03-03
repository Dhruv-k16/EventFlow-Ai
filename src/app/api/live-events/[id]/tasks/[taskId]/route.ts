// src/app/api/live-events/[id]/tasks/[taskId]/route.ts
// PATCH /api/live-events/:id/tasks/:taskId — update task status
// DELETE /api/live-events/:id/tasks/:taskId — remove a task
//
// Valid task transitions:
//   NOT_STARTED → IN_PROGRESS | DELAYED
//   IN_PROGRESS → COMPLETED   | DELAYED
//   DELAYED     → IN_PROGRESS | COMPLETED
//   COMPLETED   → (terminal — no further transitions)

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type Params = { id: string; taskId: string };

const VALID_TRANSITIONS: Record<string, string[]> = {
  NOT_STARTED: ['IN_PROGRESS', 'DELAYED'],
  IN_PROGRESS: ['COMPLETED', 'DELAYED'],
  DELAYED:     ['IN_PROGRESS', 'COMPLETED'],
  COMPLETED:   [],
};

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  const { id, taskId } = await (ctx.params as unknown as Promise<Params>);

  try {
    const task = await prisma.liveTask.findUnique({ where: { id: taskId } });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (task.liveEventId !== id) return NextResponse.json({ error: 'Task does not belong to this live event' }, { status: 403 });

    const body = await req.json();
    const { status, delayReason, assignedTo, description } = body as {
      status?:      string;
      delayReason?: string;
      assignedTo?:  string;
      description?: string;
    };

    const updateData: Record<string, unknown> = {};

    if (status) {
      const allowed = VALID_TRANSITIONS[task.status] ?? [];
      if (!allowed.includes(status))
        return NextResponse.json(
          { error: `Cannot transition from ${task.status} to ${status}. Allowed: [${allowed.join(', ')}]` },
          { status: 422 }
        );

      updateData.status = status;

      if (status === 'COMPLETED') updateData.completedAt = new Date();
      if (status === 'DELAYED' && delayReason) updateData.delayReason = delayReason;
      if (status === 'IN_PROGRESS' && task.status === 'DELAYED') updateData.delayReason = null;
    }

    if (assignedTo  !== undefined) updateData.assignedTo  = assignedTo;
    if (description !== undefined) updateData.description = description;

    const updated = await prisma.liveTask.update({ where: { id: taskId }, data: updateData });

    return NextResponse.json({
      ...updated,
      scheduledAt: updated.scheduledAt.toISOString(),
      completedAt: updated.completedAt?.toISOString() ?? null,
      createdAt:   updated.createdAt.toISOString(),
      updatedAt:   updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error('[PATCH /api/live-events/[id]/tasks/[taskId]]', err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}, ['PLANNER', 'VENDOR', 'ADMIN']);

export const DELETE = withAuth(async (_req: NextRequest, ctx) => {
  const { id, taskId } = await (ctx.params as unknown as Promise<Params>);

  try {
    const task = await prisma.liveTask.findUnique({ where: { id: taskId } });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (task.liveEventId !== id) return NextResponse.json({ error: 'Task does not belong to this live event' }, { status: 403 });
    if (task.status === 'COMPLETED')
      return NextResponse.json({ error: 'Cannot delete a completed task' }, { status: 422 });

    await prisma.liveTask.delete({ where: { id: taskId } });
    return NextResponse.json({ success: true, deletedTaskId: taskId });
  } catch (err) {
    console.error('[DELETE /api/live-events/[id]/tasks/[taskId]]', err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}, ['PLANNER', 'ADMIN']);
