// src/app/api/live-events/[id]/metrics/route.ts
// PATCH /api/live-events/:id/metrics — update changeRequestCount

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  try {
    const le = await prisma.liveEvent.findUnique({ where: { id }, select: { id: true, isActive: true, changeRequestCount: true } });
    if (!le) return NextResponse.json({ error: 'Live event not found' }, { status: 404 });

    const body = await req.json() as { changeRequestCount?: number; increment?: boolean };

    let newCount: number;
    if (body.increment === true) {
      // Convenience: just bump by 1
      newCount = (le.changeRequestCount ?? 0) + 1;
    } else if (typeof body.changeRequestCount === 'number') {
      if (body.changeRequestCount < 0)
        return NextResponse.json({ error: 'changeRequestCount must be >= 0' }, { status: 400 });
      newCount = body.changeRequestCount;
    } else {
      return NextResponse.json({ error: 'Provide changeRequestCount (number) or increment: true' }, { status: 400 });
    }

    const updated = await prisma.liveEvent.update({
      where: { id },
      data: { changeRequestCount: newCount },
      select: { id: true, changeRequestCount: true, isActive: true },
    });

    return NextResponse.json({
      id: updated.id,
      changeRequestCount: updated.changeRequestCount,
      message: `Change request count updated to ${newCount}`,
    });
  } catch (err) {
    console.error('[PATCH /api/live-events/[id]/metrics]', err);
    return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 });
  }
}, ['PLANNER', 'VENDOR', 'ADMIN']);
