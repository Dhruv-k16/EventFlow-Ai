// src/app/api/events/search/route.ts
// GET /api/events/search?q=wedding&upcoming=true
// Lets vendors search for upcoming events to offer their services

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (req: NextRequest, _ctx, _user) => {
  const { searchParams } = new URL(req.url);
  const q        = searchParams.get('q')?.trim() ?? '';
  const upcoming = searchParams.get('upcoming') !== 'false';

  try {
    const events = await prisma.event.findMany({
      where: {
        parentId: null, // top-level only
        ...(upcoming && { startDate: { gte: new Date() } }),
        ...(q && {
          OR: [
            { name:      { contains: q, mode: 'insensitive' } },
            { eventType: { contains: q, mode: 'insensitive' } },
            { location:  { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id:         true,
        name:       true,
        eventType:  true,
        startDate:  true,
        endDate:    true,
        location:   true,
        venueName:  true,
        guestCount: true,
        planner: {
          select: {
            id:          true,
            businessName:true,
            User: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        _count: { select: { bookings: true } },
      },
      orderBy: { startDate: 'asc' },
      take: 20,
    });

    return NextResponse.json({
      events: events.map(e => ({
        id:         e.id,
        name:       e.name,
        eventType:  e.eventType,
        startDate:  e.startDate.toISOString(),
        endDate:    e.endDate.toISOString(),
        location:   e.location,
        venueName:  e.venueName,
        guestCount: e.guestCount,
        plannerName: e.planner
          ? (e.planner.businessName ?? `${e.planner.User?.firstName} ${e.planner.User?.lastName}`.trim())
          : 'Self-managed',
        bookingCount: e._count.bookings,
      })),
    });
  } catch (err) {
    console.error('[GET /api/events/search]', err);
    return NextResponse.json({ error: 'Failed to search events' }, { status: 500 });
  }
}, ['VENDOR', 'PLANNER', 'ADMIN']);
