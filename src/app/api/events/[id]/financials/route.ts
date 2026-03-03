// src/app/api/events/[id]/financials/route.ts
// GET /api/events/:id/financials
// Returns full financial breakdown: per-booking costs, deposits, balance, staff costs.
// Also upserts FinancialSummary for AI/risk engine consumption.

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(
  async (_req: NextRequest, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    try {
      const event = await prisma.event.findUnique({
        where:   { id },
        include: {
          bookings: {
            include: {
              vendor: { select: { id: true, businessName: true, category: true } },
              items:  { include: { inventoryItem: { select: { name: true, unit: true } } } },
            },
          },
        },
      });

      if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

      if (user.role === 'CLIENT'  && event.clientId  !== user.sub)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      if (user.role === 'PLANNER' && event.plannerId !== user.plannerId)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });

      // Staff costs: wage × hours worked
      const staffAssignments = await prisma.staffAssignment.findMany({
        where:   { eventId: id },
        include: { staff: { select: { name: true, role: true, wage: true, vendorId: true } } },
      });

      const staffCosts = staffAssignments.map(a => {
        const hours = (a.endTime.getTime() - a.startTime.getTime()) / 3600000;
        const cost  = Number(a.staff.wage) * hours;
        return {
          staffId:   a.staffId,
          name:      a.staff.name,
          role:      a.staff.role,
          vendorId:  a.staff.vendorId,
          hours:     Math.round(hours * 100) / 100,
          wage:      Number(a.staff.wage),
          totalCost: Math.round(cost * 100) / 100,
        };
      });

      const totalStaffCost = staffCosts.reduce((sum, s) => sum + s.totalCost, 0);

      const bookingFinancials = event.bookings.map(b => {
        const totalCost   = Number(b.totalCost);
        const depositPaid = Number(b.depositPaid);
        return {
          bookingId:      b.id,
          status:         b.status,
          vendor:         b.vendor,
          items:          b.items.map(i => ({
            name:           i.inventoryItem.name,
            unit:           i.inventoryItem.unit,
            quantity:       i.quantity,
            priceAtBooking: Number(i.priceAtBooking),
            lineTotal:      Number(i.priceAtBooking) * i.quantity,
          })),
          totalCost,
          depositPaid,
          balanceDue:     Math.max(0, totalCost - depositPaid),
          isPaid:         depositPaid >= totalCost,
          paymentPercent: totalCost > 0 ? Math.min(100, Math.round((depositPaid / totalCost) * 100)) : 0,
        };
      });

      const totalEventCost  = bookingFinancials.reduce((s, b) => s + b.totalCost,   0);
      const totalPaid       = bookingFinancials.reduce((s, b) => s + b.depositPaid, 0);
      const totalBalance    = bookingFinancials.reduce((s, b) => s + b.balanceDue,  0);
      const grandTotal      = totalEventCost + totalStaffCost;
      const projectedProfit = totalPaid - totalStaffCost;

      // Upsert FinancialSummary for AI/risk engine
      await prisma.financialSummary.upsert({
        where:  { eventId: id },
        create: { eventId: id, totalRevenue: totalPaid, totalCosts: totalStaffCost, projectedProfit },
        update: { totalRevenue: totalPaid, totalCosts: totalStaffCost, projectedProfit },
      });

      return NextResponse.json({
        eventId:   event.id,
        eventName: event.name,
        startDate: event.startDate.toISOString().split('T')[0],
        endDate:   event.endDate.toISOString().split('T')[0],
        summary: {
          totalEventCost:  Math.round(totalEventCost  * 100) / 100,
          totalStaffCost:  Math.round(totalStaffCost  * 100) / 100,
          grandTotal:      Math.round(grandTotal      * 100) / 100,
          totalPaid:       Math.round(totalPaid       * 100) / 100,
          totalBalance:    Math.round(totalBalance    * 100) / 100,
          projectedProfit: Math.round(projectedProfit * 100) / 100,
          bookingCount:    event.bookings.length,
          confirmedCount:  event.bookings.filter(b => b.status === 'CONFIRMED').length,
        },
        bookings:   bookingFinancials,
        staffCosts,
      });
    } catch (err) {
      console.error('[GET /api/events/[id]/financials]', err);
      return NextResponse.json({ error: 'Failed to fetch event financials' }, { status: 500 });
    }
  },
  ['CLIENT', 'PLANNER', 'ADMIN']
);
