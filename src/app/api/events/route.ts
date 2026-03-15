// src/app/api/events/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plannerId = searchParams.get('plannerId');
  const clientId  = searchParams.get('clientId');

  if (!plannerId && !clientId) {
    return NextResponse.json({ error: 'plannerId or clientId required' }, { status: 400 });
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        parentId: null,
        ...(plannerId && { plannerId }),
        ...(clientId  && { clientId }),
      },
      include: {
        functions: {
          // FIX: Event uses startDate not date
          orderBy: { startDate: 'asc' },
          include: { _count: { select: { bookings: true } } },
        },
        bookings: {
          select: {
            id: true, status: true,
            vendor: { select: { businessName: true, category: true } },
          },
        },
        _count: { select: { functions: true, bookings: true } },
      },
      // FIX: was date — now startDate
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('[GET /api/events]', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name, eventType, description,
      type = 'SINGLE',
      date, endDate, time,
      location, venueName, guestCount,
      totalBudget, clientId, plannerId,
      functions: functionList,
    } = body;

    if (!name)     return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    if (!clientId) return NextResponse.json({ error: 'clientId is required' },  { status: 400 });

    // FIX: startDate + endDate are required (non-null) in schema
    // Use provided date or today as fallback
    const startDateVal = date    ? new Date(date)    : new Date();
    const endDateVal   = endDate ? new Date(endDate) : startDateVal;

    const event = await prisma.$transaction(async (tx) => {
      const parent = await tx.event.create({
        data: {
          name,
          eventType:   eventType   ?? null,
          description: description ?? null,
          type,
          // FIX: was date/endDate — schema fields are startDate/endDate
          startDate:   startDateVal,
          endDate:     endDateVal,
          time:        time        ?? null,
          location:    location    ?? null,
          venueName:   venueName   ?? null,
          guestCount:  guestCount  ? parseInt(guestCount) : null,
          totalBudget: totalBudget ? parseFloat(totalBudget) : null,
          clientId,
          plannerId:   plannerId   ?? null,
        },
      });

      if (type === 'MULTI_FUNCTION' && Array.isArray(functionList) && functionList.length > 0) {
        await tx.event.createMany({
          data: functionList.map((fn: any) => {
            // FIX: createMany requires startDate + endDate (non-null)
            const fnStart = fn.date ? new Date(fn.date) : startDateVal;
            return {
              name:            fn.name,
              eventType:       eventType ?? null,
              type:            'SINGLE',
              parentId:        parent.id,
              // FIX: was date — now startDate/endDate
              startDate:       fnStart,
              endDate:         fnStart,
              location:        fn.location    ?? null,
              venueName:       fn.venueName   ?? null,
              guestCount:      fn.guestCount  ? parseInt(fn.guestCount) : null,
              allocatedBudget: fn.allocatedBudget ? parseFloat(fn.allocatedBudget) : null,
              clientId,
              plannerId:       plannerId ?? null,
            };
          }),
        });
      }

      return tx.event.findUnique({
        where: { id: parent.id },
        include: {
          // FIX: was date — now startDate
          functions: { orderBy: { startDate: 'asc' } },
          _count: { select: { functions: true } },
        },
      });
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('[POST /api/events]', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
