// src/app/api/admin/financials/route.ts
// GET /api/admin/financials?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Platform-wide financial overview — ADMIN only.

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date('2000-01-01');
    const endDate   = searchParams.get('endDate')   ? new Date(searchParams.get('endDate')!)   : new Date('2099-12-31');

    try {
      const bookings = await prisma.booking.findMany({
        where:   { event: { startDate: { gte: startDate, lte: endDate } } },
        include: {
          vendor: { select: { id: true, businessName: true, category: true } },
          event:  { select: { id: true, name: true, startDate: true } },
        },
      });

      const events = await prisma.event.count({
        where: { startDate: { gte: startDate, lte: endDate } },
      });

      // Vendor revenue aggregation
      const vendorMap = new Map<string, { businessName: string; category: string; revenue: number; collected: number; bookingCount: number }>();
      for (const b of bookings) {
        if (!['CONFIRMED', 'COMPLETED'].includes(b.status)) continue;
        const existing = vendorMap.get(b.vendorId) ?? { businessName: b.vendor.businessName, category: b.vendor.category, revenue: 0, collected: 0, bookingCount: 0 };
        existing.revenue      += Number(b.totalCost);
        existing.collected    += Number(b.depositPaid);
        existing.bookingCount += 1;
        vendorMap.set(b.vendorId, existing);
      }

      const topVendors = Array.from(vendorMap.entries())
        .map(([vendorId, v]) => ({ vendorId, ...v, revenue: Math.round(v.revenue * 100) / 100, collected: Math.round(v.collected * 100) / 100 }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const confirmed   = bookings.filter(b => ['CONFIRMED', 'COMPLETED'].includes(b.status));
      const pending     = bookings.filter(b => !['CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED_CAPACITY'].includes(b.status));
      const cancelled   = bookings.filter(b => b.status === 'CANCELLED');

      const totalRevenue     = confirmed.reduce((s, b) => s + Number(b.totalCost),   0);
      const totalCollected   = confirmed.reduce((s, b) => s + Number(b.depositPaid), 0);
      const totalOutstanding = confirmed.reduce((s, b) => s + Math.max(0, Number(b.totalCost) - Number(b.depositPaid)), 0);

      const categoryMap = new Map<string, number>();
      for (const b of confirmed) {
        const cat = b.vendor.category;
        categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + Number(b.totalCost));
      }
      const byCategory = Array.from(categoryMap.entries())
        .map(([category, revenue]) => ({ category, revenue: Math.round(revenue * 100) / 100 }))
        .sort((a, b) => b.revenue - a.revenue);

      return NextResponse.json({
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate:   endDate.toISOString().split('T')[0],
        },
        summary: {
          totalRevenue:     Math.round(totalRevenue     * 100) / 100,
          totalCollected:   Math.round(totalCollected   * 100) / 100,
          totalOutstanding: Math.round(totalOutstanding * 100) / 100,
          totalBookings:    bookings.length,
          confirmedCount:   confirmed.length,
          pendingCount:     pending.length,
          cancelledCount:   cancelled.length,
          totalEvents:      events,
          activeVendors:    vendorMap.size,
        },
        byCategory,
        topVendors,
      });
    } catch (err) {
      console.error('[GET /api/admin/financials]', err);
      return NextResponse.json({ error: 'Failed to fetch platform financials' }, { status: 500 });
    }
  },
  ['ADMIN']
);
