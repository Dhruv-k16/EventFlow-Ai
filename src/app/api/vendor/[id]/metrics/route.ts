// src/app/api/vendor/[id]/metrics/route.ts
// PATCH /api/vendor/:id/metrics — update delivery/order counters

import { JWTPayload, withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  const user = (req as NextRequest & { user: JWTPayload }).user;

  // Vendors can only update their own metrics
  if (user.role === 'VENDOR') {
    const v = await prisma.vendor.findUnique({ where: { userId: user.sub }, select: { id: true } });
    if (!v || v.id !== id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const vendor = await prisma.vendor.findUnique({ where: { id }, select: { id: true } });
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    const body = await req.json() as {
      totalDeliveries?:    number;
      delayedDeliveries?:  number;
      lastMinuteRequests?: number;
      totalOrders?:        number;
      incrementDelayedDelivery?:  boolean;
      incrementLastMinuteRequest?: boolean;
    };

    const data: Record<string, number> = {};

    if (typeof body.totalDeliveries    === 'number') data.totalDeliveries    = body.totalDeliveries;
    if (typeof body.delayedDeliveries  === 'number') data.delayedDeliveries  = body.delayedDeliveries;
    if (typeof body.lastMinuteRequests === 'number') data.lastMinuteRequests = body.lastMinuteRequests;
    if (typeof body.totalOrders        === 'number') data.totalOrders        = body.totalOrders;

    // Convenience increments
    if (body.incrementDelayedDelivery) {
      const current = await prisma.vendor.findUnique({ where: { id } });
      data.delayedDeliveries = ((current as unknown as { delayedDeliveries: number }).delayedDeliveries ?? 0) + 1;
      data.totalDeliveries   = ((current as unknown as { totalDeliveries: number }).totalDeliveries ?? 0) + 1;
    }
    if (body.incrementLastMinuteRequest) {
      const current = await prisma.vendor.findUnique({ where: { id } });
      data.lastMinuteRequests = ((current as unknown as { lastMinuteRequests: number }).lastMinuteRequests ?? 0) + 1;
      data.totalOrders        = ((current as unknown as { totalOrders: number }).totalOrders ?? 0) + 1;
    }

    if (Object.keys(data).length === 0)
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });

    const updated = await prisma.vendor.update({ where: { id }, data });

    return NextResponse.json({
      id: vendor.id,
      metrics: {
        totalDeliveries:    (updated as unknown as { totalDeliveries: number }).totalDeliveries,
        delayedDeliveries:  (updated as unknown as { delayedDeliveries: number }).delayedDeliveries,
        lastMinuteRequests: (updated as unknown as { lastMinuteRequests: number }).lastMinuteRequests,
        totalOrders:        (updated as unknown as { totalOrders: number }).totalOrders,
      },
      message: 'Vendor metrics updated',
    });
  } catch (err) {
    console.error('[PATCH /api/vendor/[id]/metrics]', err);
    return NextResponse.json({ error: 'Failed to update vendor metrics' }, { status: 500 });
  }
}, ['VENDOR', 'ADMIN']);
