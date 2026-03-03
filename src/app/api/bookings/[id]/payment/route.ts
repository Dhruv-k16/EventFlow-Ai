// src/app/api/bookings/[id]/payment/route.ts
// GET   /api/bookings/:id/payment — get payment status
// PATCH /api/bookings/:id/payment — record a payment (additive)
//
// SRS rules:
//   - Only CONFIRMED bookings can accept payment
//   - depositPaid cannot exceed totalCost
//   - Payment is additive: adds to existing depositPaid

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(
  async (_req: NextRequest, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
    try {
      const booking = await prisma.booking.findUnique({
        where:   { id },
        include: {
          vendor: { select: { id: true, businessName: true } },
          event:  { select: { id: true, name: true, startDate: true } },
        },
      });
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      if (user.role === 'VENDOR' && booking.vendorId !== user.vendorId)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });

      const totalCost   = Number(booking.totalCost);
      const depositPaid = Number(booking.depositPaid);
      const balanceDue  = totalCost - depositPaid;

      return NextResponse.json({
        bookingId: booking.id,
        status:    booking.status,
        vendor:    booking.vendor,
        event: {
          id:        booking.event.id,
          name:      booking.event.name,
          startDate: booking.event.startDate.toISOString().split('T')[0],
        },
        financials: {
          totalCost,
          depositPaid,
          balanceDue:     Math.max(0, balanceDue),
          isPaid:         balanceDue <= 0,
          paymentPercent: totalCost > 0 ? Math.min(100, Math.round((depositPaid / totalCost) * 100)) : 0,
        },
      });
    } catch (err) {
      console.error('[GET /api/bookings/[id]/payment]', err);
      return NextResponse.json({ error: 'Failed to fetch payment status' }, { status: 500 });
    }
  }
);

export const PATCH = withAuth(
  async (req: NextRequest, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
    try {
      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

      if (booking.status !== 'CONFIRMED')
        return NextResponse.json({ error: `Payment can only be recorded for CONFIRMED bookings. Current: ${booking.status}` }, { status: 422 });
      if (user.role === 'VENDOR' && booking.vendorId !== user.vendorId)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });

      const { amount, paymentType } = await req.json() as { amount: number; paymentType?: string };
      if (!amount || amount <= 0)
        return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });

      const totalCost      = Number(booking.totalCost);
      const currentDeposit = Number(booking.depositPaid);
      const newTotal       = currentDeposit + amount;

      if (newTotal > totalCost)
        return NextResponse.json(
          { error: `Payment would exceed total cost. Balance due: ${totalCost - currentDeposit}`, balanceDue: totalCost - currentDeposit },
          { status: 400 }
        );

      const updated    = await prisma.booking.update({ where: { id }, data: { depositPaid: newTotal } });
      const balanceDue = totalCost - newTotal;

      return NextResponse.json({
        bookingId: updated.id,
        payment:   { amountRecorded: amount, paymentType: paymentType ?? 'PARTIAL' },
        financials: {
          totalCost,
          depositPaid:    Number(updated.depositPaid),
          balanceDue:     Math.max(0, balanceDue),
          isPaid:         balanceDue <= 0,
          paymentPercent: Math.min(100, Math.round((newTotal / totalCost) * 100)),
        },
        updatedAt: updated.updatedAt.toISOString(),
      });
    } catch (err) {
      console.error('[PATCH /api/bookings/[id]/payment]', err);
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }
  },
  ['PLANNER', 'ADMIN', 'VENDOR']
);
