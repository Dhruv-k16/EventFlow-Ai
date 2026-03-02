// src/app/api/events/[id]/route.ts
// GET    /api/events/:id  — full event detail with all bookings + meetings
// PATCH  /api/events/:id  — update event details (name, dates, location, etc.)
// DELETE /api/events/:id  — delete event (only if no CONFIRMED bookings)

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ── GET — any authenticated role can view if they have access ────────────────
export const GET = withAuth(
  async (_req: NextRequest, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    try {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          client:  { select: { id: true, firstName: true, lastName: true, email: true } },
          planner: { select: { id: true, userId: true, businessName: true } },
          bookings: {
            include: {
              vendor:   { select: { id: true, businessName: true, category: true, rating: true } },
              items:    { include: { inventoryItem: true } },
              meetings: { orderBy: { phase: 'asc' } },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: { select: { bookings: true } },
        },
      });

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // ── Access control ───────────────────────────────────────────────────
      if (user.role === 'CLIENT'  && event.clientId  !== user.sub)        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      if (user.role === 'PLANNER' && event.plannerId !== user.plannerId)  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      // VENDOR: can see events if they have a booking for it
      if (user.role === 'VENDOR') {
        const hasBooking = event.bookings.some(b => b.vendorId === user.vendorId);
        if (!hasBooking) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      return NextResponse.json({
        id:          event.id,
        name:        event.name,
        eventType:   event.eventType,
        startDate:   event.startDate.toISOString().split('T')[0],
        endDate:     event.endDate.toISOString().split('T')[0],
        isMultiDay:  event.isMultiDay,
        location:    event.location,
        guestCount:  event.guestCount,
        description: event.description,
        clientId:    event.clientId,
        plannerId:   event.plannerId,
        client:      event.client,
        planner:     event.planner,
        bookingCount: event._count.bookings,
        bookings:    event.bookings.map(b => ({
          id:              b.id,
          status:          b.status,
          vendorId:        b.vendorId,
          vendor:          { ...b.vendor, rating: Number(b.vendor.rating) },
          items:           b.items.map(i => ({
            id:              i.id,
            inventoryItemId: i.inventoryItemId,
            inventoryItem:   { ...i.inventoryItem, basePrice: Number(i.inventoryItem.basePrice) },
            quantity:        i.quantity,
            priceAtBooking:  Number(i.priceAtBooking),
          })),
          meetings:        b.meetings,
          totalCost:       Number(b.totalCost),
          depositPaid:     Number(b.depositPaid),
          notes:           b.notes,
          rejectionReason: b.rejectionReason,
          createdAt:       b.createdAt.toISOString(),
          updatedAt:       b.updatedAt.toISOString(),
        })),
        createdAt:   event.createdAt.toISOString(),
        updatedAt:   event.updatedAt.toISOString(),
      });
    } catch (err) {
      console.error('[GET /api/events/[id]]', err);
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
    }
  }
);

// ── PATCH — client/planner/admin only ────────────────────────────────────────
export const PATCH = withAuth(
  async (req: NextRequest, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    try {
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

      // Access control
      if (user.role === 'CLIENT'  && event.clientId !== user.sub)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      if (user.role === 'PLANNER' && event.plannerId !== user.plannerId)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });

      const body = await req.json();
      const { name, eventType, startDate: startParam, endDate: endParam,
              location, guestCount, description, plannerId } = body;

      let updateData: Record<string, unknown> = {};

      if (name !== undefined)        updateData.name        = name.trim();
      if (eventType !== undefined)   updateData.eventType   = eventType?.trim() ?? null;
      if (location !== undefined)    updateData.location    = location?.trim() ?? null;
      if (guestCount !== undefined)  updateData.guestCount  = guestCount;
      if (description !== undefined) updateData.description = description?.trim() ?? null;
      if (plannerId !== undefined)   updateData.plannerId   = plannerId;

      // Date update — recompute isMultiDay
      if (startParam !== undefined || endParam !== undefined) {
        const newStart = startParam ? new Date(startParam) : event.startDate;
        const newEnd   = endParam   ? new Date(endParam)   : event.endDate;

        if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
          return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }
        if (newEnd < newStart) {
          return NextResponse.json({ error: 'endDate cannot be before startDate' }, { status: 400 });
        }

        updateData.startDate  = newStart;
        updateData.endDate    = newEnd;
        updateData.isMultiDay = newStart.toISOString().split('T')[0] !== newEnd.toISOString().split('T')[0];
      }

      const updated = await prisma.event.update({
        where: { id },
        data:  updateData,
      });

      return NextResponse.json({
        id:          updated.id,
        name:        updated.name,
        eventType:   updated.eventType,
        startDate:   updated.startDate.toISOString().split('T')[0],
        endDate:     updated.endDate.toISOString().split('T')[0],
        isMultiDay:  updated.isMultiDay,
        location:    updated.location,
        guestCount:  updated.guestCount,
        description: updated.description,
        clientId:    updated.clientId,
        plannerId:   updated.plannerId,
        createdAt:   updated.createdAt.toISOString(),
        updatedAt:   updated.updatedAt.toISOString(),
      });
    } catch (err) {
      console.error('[PATCH /api/events/[id]]', err);
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
  },
  ['CLIENT', 'PLANNER', 'ADMIN']
);

// ── DELETE — client/planner/admin — blocked if CONFIRMED bookings exist ───────
export const DELETE = withAuth(
  async (_req: NextRequest, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    try {
      const event = await prisma.event.findUnique({
        where:   { id },
        include: { bookings: { select: { id: true, status: true } } },
      });

      if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

      // Access control
      if (user.role === 'CLIENT'  && event.clientId !== user.sub)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      if (user.role === 'PLANNER' && event.plannerId !== user.plannerId)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });

      // Prevent deletion if any booking is CONFIRMED (inventory is allocated)
      const confirmedBookings = event.bookings.filter(b => b.status === 'CONFIRMED');
      if (confirmedBookings.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete event with ${confirmedBookings.length} confirmed booking(s). Cancel them first.`,
            confirmedBookingIds: confirmedBookings.map(b => b.id),
          },
          { status: 409 }
        );
      }

      await prisma.event.delete({ where: { id } });

      return NextResponse.json({ success: true, deletedEventId: id });
    } catch (err) {
      console.error('[DELETE /api/events/[id]]', err);
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
  },
  ['CLIENT', 'PLANNER', 'ADMIN']
);
