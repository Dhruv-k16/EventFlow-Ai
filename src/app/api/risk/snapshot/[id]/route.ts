// src/app/api/risk/snapshot/[id]/route.ts
// GET /api/risk/snapshot/:id — retrieve a saved RiskSnapshot

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  try {
    const snapshot = await prisma.riskSnapshot.findUnique({ where: { id } });
    if (!snapshot) return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
    return NextResponse.json(snapshot);
  } catch (err) {
    console.error('[GET /api/risk/snapshot/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch snapshot' }, { status: 500 });
  }
}, ['PLANNER', 'VENDOR', 'CLIENT', 'ADMIN']);
