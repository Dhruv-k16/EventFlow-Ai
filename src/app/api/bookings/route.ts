// src/app/api/bookings/route.ts
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkInventoryAvailability, checkVendorCapacity } from '@/lib/slotEngine';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
  try {
    const body = await req.json();
    const { eventId, vendorId, items, notes } = body as {
      eventId: string; vendorId: string; notes?: string;
      items: { inventoryItemId: string; quantity: number }[];
    };

    if (!eventId || !vendorId || !items?.length) {
      return NextResponse.json({ error: 'eventId, vendorId, and items[] are required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const capacityCheck = await checkVendorCapacity(vendorId, event.startDate, event.endDate);
    if (!capacityCheck.canAccept) {
      return NextResponse.json({ error: `Vendor is not available: ${capacityCheck.reason}` }, { status: 409 });
    }

    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { id: { in: items.map(i => i.inventoryItemId) } },
    });
    if (inventoryItems.length !== items.length) {
      return NextResponse.json({ error: 'One or more inventory items not found' }, { status: 404 });
    }

    const inventoryCheck = await checkInventoryAvailability(items, event.startDate, event.endDate);
    if (!inventoryCheck.available) {
      return NextResponse.json({ error: 'Some items do not have sufficient stock', conflicts: inventoryCheck.conflicts }, { status: 409 });
    }

    const totalCost = items.reduce((sum, item) => {
      const inv = inventoryItems.find((i: { id: string }) => i.id === item.inventoryItemId)!;
      return sum + Number(inv.basePrice) * item.quantity;
    }, 0);

    const booking = await prisma.booking.create({
      data: {
        eventId, vendorId, status: 'REQUESTED', notes, totalCost,
        items: {
          create: items.map(item => {
            const inv = inventoryItems.find((i: { id: string }) => i.id === item.inventoryItemId)!;
            return { inventoryItemId: item.inventoryItemId, quantity: item.quantity, priceAtBooking: inv.basePrice };
          }),
        },
      },
      include: {
        items:        { include: { inventoryItem: true } },
        vendor:       true,
        event:        true,
        MeetingRecord: true, // FIX: was meetings
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error('[POST /api/bookings]', err);
    return NextResponse.json({ error: 'Booking creation failed' }, { status: 500 });
  }
}, ['PLANNER', 'CLIENT', 'VENDOR']);

export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    const bookings = await prisma.booking.findMany({
      where: { ...(eventId ? { eventId } : {}) },
      include: {
        items:        { include: { inventoryItem: true } },
        vendor:       true,
        MeetingRecord: { orderBy: { phase: 'asc' } }, // FIX: was meetings
        event:        { select: { name: true, startDate: true, endDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error('[GET /api/bookings]', err);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}, ['PLANNER', 'CLIENT', 'ADMIN']);
