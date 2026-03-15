// src/app/api/live-events/[id]/tasks/route.ts
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  try {
    const le = await prisma.liveEvent.findUnique({ where: { id }, select: { id: true } });
    if (!le) return NextResponse.json({ error: 'Live event not found' }, { status: 404 });
    const tasks = await prisma.liveTask.findMany({ where: { liveEventId: id }, orderBy: { scheduledAt: 'asc' } });
    return NextResponse.json(tasks.map(t => ({
      ...t,
      scheduledAt: t.scheduledAt.toISOString(),
      completedAt: t.completedAt?.toISOString() ?? null,
      createdAt:   t.createdAt.toISOString(),
      updatedAt:   t.updatedAt.toISOString(),
    })));
  } catch (err) {
    console.error('[GET /api/live-events/[id]/tasks]', err);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  try {
    const le = await prisma.liveEvent.findUnique({ where: { id }, select: { id: true, isActive: true } });
    if (!le) return NextResponse.json({ error: 'Live event not found' }, { status: 404 });
    if (!le.isActive) return NextResponse.json({ error: 'Cannot add tasks to a concluded event' }, { status: 422 });

    const body = await req.json();
    const { title, description, assignedTo, scheduledAt } = body as {
      title: string; description?: string; assignedTo?: string; scheduledAt: string;
    };
    if (!title?.trim() || !scheduledAt) return NextResponse.json({ error: 'title and scheduledAt are required' }, { status: 400 });

    const task = await prisma.liveTask.create({
      // FIX: LiveTask has no @default(uuid()) — must supply id + updatedAt
      data: {
        id:          crypto.randomUUID(),
        updatedAt:   new Date(),
        liveEventId: id,
        title:       title.trim(),
        description: description?.trim() ?? null,
        assignedTo:  assignedTo ?? null,
        scheduledAt: new Date(scheduledAt),
        status:      'NOT_STARTED',
      },
    });

    return NextResponse.json({
      ...task,
      scheduledAt: task.scheduledAt.toISOString(),
      completedAt: null,
      createdAt:   task.createdAt.toISOString(),
      updatedAt:   task.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/live-events/[id]/tasks]', err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}, ['PLANNER', 'VENDOR', 'ADMIN']);
