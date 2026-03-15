// src/app/api/events/[id]/sub-events/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const parent = await prisma.event.findUnique({
      where:  { id },
      select: { id: true, name: true, type: true },
    });
    if (!parent) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const functions = await prisma.event.findMany({
      where: { parentId: id },
      include: {
        bookings: {
          include: {
            vendor: { select: { id: true, businessName: true, category: true, avatarUrl: true } },
          },
        },
        _count: { select: { bookings: true } },
      },
      // FIX: was date — now startDate
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ parent, functions });
  } catch (error) {
    console.error('[GET /api/events/:id/sub-events]', error);
    return NextResponse.json({ error: 'Failed to fetch functions' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const parentId = (await params).id;

  try {
    const parent = await prisma.event.findUnique({
      where:  { id: parentId },
      select: { id: true, clientId: true, plannerId: true, eventType: true, type: true, startDate: true },
    });
    if (!parent) return NextResponse.json({ error: 'Parent event not found' }, { status: 404 });

    const body = await req.json();
    const { name, date, location, venueName, guestCount, allocatedBudget } = body;
    if (!name) return NextResponse.json({ error: 'Function name is required' }, { status: 400 });

    if (parent.type === 'SINGLE') {
      await prisma.event.update({ where: { id: parentId }, data: { type: 'MULTI_FUNCTION' } });
    }

    // FIX: startDate + endDate are required non-null — use parent startDate as fallback
    const startDateVal = date ? new Date(date) : parent.startDate ?? new Date();

    const fn = await prisma.event.create({
      data: {
        name,
        type:            'SINGLE',
        parentId,
        eventType:       parent.eventType  ?? null,
        // FIX: was date — now startDate/endDate (both required)
        startDate:       startDateVal,
        endDate:         startDateVal,
        location:        location          ?? null,
        venueName:       venueName         ?? null,
        guestCount:      guestCount ? parseInt(guestCount) : null,
        allocatedBudget: allocatedBudget ? parseFloat(allocatedBudget) : null,
        clientId:        parent.clientId,
        plannerId:       parent.plannerId  ?? null,
      },
      include: { _count: { select: { bookings: true } } },
    });

    return NextResponse.json(fn, { status: 201 });
  } catch (error) {
    console.error('[POST /api/events/:id/sub-events]', error);
    return NextResponse.json({ error: 'Failed to add function' }, { status: 500 });
  }
}
