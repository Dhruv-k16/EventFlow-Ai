// src/app/api/events/route.ts
// POST /api/events  — create a new event (CLIENT or PLANNER)
// GET  /api/events  — list events filtered by role
//
// Role visibility rules:
//   CLIENT  → sees only their own events (clientId = user.sub)
//   PLANNER → sees events they manage (plannerId = user.plannerId)
//   ADMIN   → sees all events
//   VENDOR  → 403 (vendors don't create or own events)
//
// isMultiDay is computed server-side: true if endDate > startDate (different calendar day)

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
  try {
    const body = await req.json();
    const {
      name,
      eventType,
      startDate: startParam,
      endDate:   endParam,
      location,
      guestCount,
      description,
      plannerId,   // optional: assign a planner at creation time
    } = body as {
      name:         string;
      eventType?:   string;
      startDate:    string;
      endDate:      string;
      location?:    string;
      guestCount?:  number;
      description?: string;
      plannerId?:   string;
    };

    // ── Validate ────────────────────────────────────────────────────────────
    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: 'startDate and endDate are required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const startDate = new Date(startParam);
    const endDate   = new Date(endParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }
    if (endDate < startDate) {
      return NextResponse.json({ error: 'endDate cannot be before startDate' }, { status: 400 });
    }

    // ── Determine clientId ─────────────────────────────────────────────────
    // CLIENT creates for themselves. PLANNER creates on behalf of a client.
    // For now, planners also set themselves as client unless clientId provided.
    const clientId = user.sub;

    // ── Resolve plannerId ──────────────────────────────────────────────────
    // If the creator is a planner, auto-assign their profile
    let resolvedPlannerId: string | null = plannerId ?? null;
    if (user.role === 'PLANNER' && !resolvedPlannerId) {
      resolvedPlannerId = user.plannerId ?? null;
    }

    // ── isMultiDay: true if endDate is a different calendar day ───────────
    const startDay = startDate.toISOString().split('T')[0];
    const endDay   = endDate.toISOString().split('T')[0];
    const isMultiDay = startDay !== endDay;

    // ── Create event ───────────────────────────────────────────────────────
    const event = await prisma.event.create({
      data: {
        name:         name.trim(),
        eventType:    eventType?.trim() ?? null,
        startDate,
        endDate,
        isMultiDay,
        location:     location?.trim() ?? null,
        guestCount:   guestCount ?? null,
        description:  description?.trim() ?? null,
        clientId,
        plannerId:    resolvedPlannerId,
      },
      include: {
        client:  { select: { id: true, firstName: true, lastName: true, email: true } },
        planner: { select: { id: true, userId: true } },
      },
    });

    return NextResponse.json(
      {
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
        createdAt:   event.createdAt.toISOString(),
        updatedAt:   event.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/events]', err);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}, ['CLIENT', 'PLANNER', 'ADMIN']);

export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    // ── Role-based filter ──────────────────────────────────────────────────
    let whereClause: Record<string, unknown> = {};

    if (user.role === 'CLIENT') {
      whereClause = { clientId: user.sub };
    } else if (user.role === 'PLANNER') {
      whereClause = { plannerId: user.plannerId };
    }
    // ADMIN sees everything — no filter

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        bookings: {
          include: {
            vendor:   { select: { id: true, businessName: true, category: true } },
            meetings: { orderBy: { phase: 'asc' } },
          },
        },
        client:  { select: { firstName: true, lastName: true, email: true } },
        planner: { select: { id: true } },
        _count:  { select: { bookings: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(
      events.map(e => ({
        id:           e.id,
        name:         e.name,
        eventType:    e.eventType,
        startDate:    e.startDate.toISOString().split('T')[0],
        endDate:      e.endDate.toISOString().split('T')[0],
        isMultiDay:   e.isMultiDay,
        location:     e.location,
        guestCount:   e.guestCount,
        description:  e.description,
        clientId:     e.clientId,
        plannerId:    e.plannerId,
        bookingCount: e._count.bookings,
        bookings:     e.bookings.map(b => ({
          id:       b.id,
          status:   b.status,
          vendorId: b.vendorId,
          vendor:   b.vendor,
          totalCost: Number(b.totalCost),
          meetings: b.meetings,
        })),
        createdAt:    e.createdAt.toISOString(),
        updatedAt:    e.updatedAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error('[GET /api/events]', err);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}, ['CLIENT', 'PLANNER', 'ADMIN']);
