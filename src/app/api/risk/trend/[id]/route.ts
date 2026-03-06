// src/app/api/risk/trend/[id]/route.ts
// GET /api/risk/trend/:id?type=EVENT|VENDOR&role=PLANNER|CLIENT|VENDOR&limit=30
// Returns historical risk scores for Recharts line graphs

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  const params  = new URL(req.url).searchParams;
  const type    = (params.get('type')  ?? 'EVENT').toUpperCase();
  const role    = (params.get('role')  ?? 'PLANNER').toUpperCase();
  const limit   = Math.min(90, parseInt(params.get('limit') ?? '30', 10));

  try {
    const snapshots = await prisma.riskSnapshot.findMany({
      where: { targetId: id, targetType: type, role },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true, createdAt: true, riskScore: true, factors: true, aiSummary: true, alerts: true },
    });

    const trend = snapshots.map(s => ({
      id:        s.id,
      date:      s.createdAt.toISOString().split('T')[0],
      timestamp: s.createdAt.toISOString(),
      score:     s.riskScore,
      level:     s.riskScore >= 75 ? 'CRITICAL' : s.riskScore >= 50 ? 'HIGH' : s.riskScore >= 25 ? 'MEDIUM' : 'LOW',
      factors:   s.factors,
      alerts:    s.alerts,
    }));

    return NextResponse.json({
      targetId: id, targetType: type, role, count: trend.length,
      trend,
      summary: {
        latest:  trend.at(-1)?.score   ?? null,
        highest: trend.length ? Math.max(...trend.map(t => t.score)) : null,
        lowest:  trend.length ? Math.min(...trend.map(t => t.score)) : null,
        average: trend.length ? Math.round(trend.reduce((s, t) => s + t.score, 0) / trend.length) : null,
      },
    });
  } catch (err) {
    console.error('[GET /api/risk/trend/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch trend data' }, { status: 500 });
  }
}, ['PLANNER', 'VENDOR', 'CLIENT', 'ADMIN']);
