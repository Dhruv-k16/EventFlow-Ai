// src/app/api/vendor/[id]/financials/route.ts
// GET /api/vendor/:id/financials?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Vendor revenue summary: confirmed bookings, collected payments, outstanding balance,
// staff wage costs, and net profit estimate.

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(
  async (req: NextRequest, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    if (user.role === 'VENDOR' && user.vendorId !== id)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date('2000-01-01');
    const endDate   = searchParams.get('endDate')   ? new Date(searchParams.get('endDate')!)   : new Date('2099-12-31');

    try {
      const vendor = await prisma.vendor.findUnique({ where: { id }, select: { id: true, businessName: true } });
      if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

      const bookings = await prisma.booking.findMany({
        where: { vendorId: id, event: { startDate: { gte: startDate, lte: endDate } } },
        include: {
          event: { select: { id: true, name: true, startDate: true, endDate: true } },
          items: { include: { inventoryItem: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const staffAssignments = await prisma.staffAssignment.findMany({
        where: { staff: { vendorId: id }, startTime: { gte: startDate }, endTime: { lte: endDate } },
        include: { staff: { select: { name: true, role: true, wage: true } }, event: { select: { name: true } } },
      });

      const totalWageCost = staffAssignments.reduce((sum, a) => {
        const hours = (a.endTime.getTime() - a.startTime.getTime()) / 3600000;
        return sum + Number(a.staff.wage) * hours;
      }, 0);

      const bookingDetails = bookings.map(b => ({
        bookingId:   b.id,
        status:      b.status,
        event:       { id: b.event.id, name: b.event.name, startDate: b.event.startDate.toISOString().split('T')[0] },
        totalCost:   Number(b.totalCost),
        depositPaid: Number(b.depositPaid),
        balanceDue:  Math.max(0, Number(b.totalCost) - Number(b.depositPaid)),
        isPaid:      Number(b.depositPaid) >= Number(b.totalCost),
      }));

      const confirmed   = bookings.filter(b => ['CONFIRMED', 'COMPLETED'].includes(b.status));
      const pending     = bookings.filter(b => !['CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED_CAPACITY'].includes(b.status));
      const cancelled   = bookings.filter(b => b.status === 'CANCELLED');

      const totalRevenue     = confirmed.reduce((s, b) => s + Number(b.totalCost),   0);
      const totalCollected   = confirmed.reduce((s, b) => s + Number(b.depositPaid), 0);
      const totalOutstanding = confirmed.reduce((s, b) => s + Math.max(0, Number(b.totalCost) - Number(b.depositPaid)), 0);
      const netProfit        = totalCollected - totalWageCost;

      return NextResponse.json({
        vendorId:     vendor.id,
        businessName: vendor.businessName,
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate:   endDate.toISOString().split('T')[0],
        },
        summary: {
          totalRevenue:     Math.round(totalRevenue     * 100) / 100,
          totalCollected:   Math.round(totalCollected   * 100) / 100,
          totalOutstanding: Math.round(totalOutstanding * 100) / 100,
          totalWageCost:    Math.round(totalWageCost    * 100) / 100,
          netProfit:        Math.round(netProfit        * 100) / 100,
          bookingCount:     bookings.length,
          confirmedCount:   confirmed.length,
          pendingCount:     pending.length,
          cancelledCount:   cancelled.length,
        },
        bookings: bookingDetails,
      });
    } catch (err) {
      console.error('[GET /api/vendor/[id]/financials]', err);
      return NextResponse.json({ error: 'Failed to fetch vendor financials' }, { status: 500 });
    }
  },
  ['VENDOR', 'ADMIN']
);
