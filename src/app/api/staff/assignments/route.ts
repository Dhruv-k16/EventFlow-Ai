// src/app/api/staff/assignments/route.ts
// GET  /api/staff/assignments?staffId=X&eventId=Y  — list assignments
// POST /api/staff/assignments                       — assign staff to event
//
// SRS Phase 3 rule: Staff cannot be double-booked.
// Overlap detection: reject if new window [startTime, endTime] overlaps
// any existing assignment for the same staffId.
// Overlap condition: newStart < existingEnd AND newEnd > existingStart

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ── GET — authenticated ───────────────────────────────────────────────────────
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
  const { searchParams } = new URL(req.url);
  const staffId  = searchParams.get('staffId');
  const eventId  = searchParams.get('eventId');
  const vendorId = searchParams.get('vendorId');

  try {
    // Build where clause
    const where: Record<string, unknown> = {};
    if (staffId)  where.staffId  = staffId;
    if (eventId)  where.eventId  = eventId;

    // Vendors can only see assignments for their own staff
    if (user.role === 'VENDOR') {
      where.staff = { vendorId: user.vendorId };
    } else if (vendorId) {
      where.staff = { vendorId };
    }

    const assignments = await prisma.staffAssignment.findMany({
      where,
      include: {
        staff: { select: { id: true, name: true, role: true, status: true, vendorId: true } },
        event: { select: { id: true, name: true, startDate: true, endDate: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(assignments.map(a => ({
      id:        a.id,
      staffId:   a.staffId,
      eventId:   a.eventId,
      startTime: a.startTime.toISOString(),
      endTime:   a.endTime.toISOString(),
      staff: {
        id:       a.staff.id,
        name:     a.staff.name,
        role:     a.staff.role,
        status:   a.staff.status,
        vendorId: a.staff.vendorId,
      },
      event: {
        id:        a.event.id,
        name:      a.event.name,
        startDate: a.event.startDate.toISOString().split('T')[0],
        endDate:   a.event.endDate.toISOString().split('T')[0],
      },
    })));
  } catch (err) {
    console.error('[GET /api/staff/assignments]', err);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}, ['VENDOR', 'PLANNER', 'ADMIN']);

// ── POST — vendor/planner/admin ───────────────────────────────────────────────
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
  try {
    const body = await req.json();
    const { staffId, eventId, startTime: startParam, endTime: endParam } = body as {
      staffId:   string;
      eventId:   string;
      startTime: string;
      endTime:   string;
    };

    if (!staffId || !eventId || !startParam || !endParam) {
      return NextResponse.json(
        { error: 'staffId, eventId, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    const startTime = new Date(startParam);
    const endTime   = new Date(endParam);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json({ error: 'Invalid datetime format. Use ISO 8601.' }, { status: 400 });
    }
    if (endTime <= startTime) {
      return NextResponse.json({ error: 'endTime must be after startTime' }, { status: 400 });
    }

    // ── Load staff + verify ownership ─────────────────────────────────────
    const staff = await prisma.staff.findUnique({
      where:  { id: staffId },
      select: { id: true, name: true, role: true, vendorId: true },
    });
    if (!staff) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });

    if (user.role === 'VENDOR' && staff.vendorId !== user.vendorId) {
      return NextResponse.json({ error: 'You can only assign your own staff' }, { status: 403 });
    }

    // ── Load event ─────────────────────────────────────────────────────────
    const event = await prisma.event.findUnique({
      where:  { id: eventId },
      select: { id: true, name: true, startDate: true, endDate: true },
    });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    // ── SRS: Overlap detection ─────────────────────────────────────────────
    // Reject if [startTime, endTime] overlaps any existing assignment for this staff.
    // Overlap: newStart < existingEnd AND newEnd > existingStart
    const overlapping = await prisma.staffAssignment.findFirst({
      where: {
        staffId,
        startTime: { lt: endTime   },
        endTime:   { gt: startTime },
      },
      include: {
        event: { select: { name: true, startDate: true } },
      },
    });

    if (overlapping) {
      return NextResponse.json(
        {
          error: `${staff.name} is already assigned during this time window`,
          conflict: {
            assignmentId: overlapping.id,
            eventName:    overlapping.event.name,
            startTime:    overlapping.startTime.toISOString(),
            endTime:      overlapping.endTime.toISOString(),
          },
        },
        { status: 409 }
      );
    }

    // ── Create assignment ──────────────────────────────────────────────────
    const assignment = await prisma.staffAssignment.create({
      data: { staffId, eventId, startTime, endTime },
      include: {
        staff: { select: { id: true, name: true, role: true, vendorId: true } },
        event: { select: { id: true, name: true, startDate: true, endDate: true } },
      },
    });

    return NextResponse.json(
      {
        id:        assignment.id,
        staffId:   assignment.staffId,
        eventId:   assignment.eventId,
        startTime: assignment.startTime.toISOString(),
        endTime:   assignment.endTime.toISOString(),
        staff: {
          id:       assignment.staff.id,
          name:     assignment.staff.name,
          role:     assignment.staff.role,
          vendorId: assignment.staff.vendorId,
        },
        event: {
          id:        assignment.event.id,
          name:      assignment.event.name,
          startDate: assignment.event.startDate.toISOString().split('T')[0],
          endDate:   assignment.event.endDate.toISOString().split('T')[0],
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/staff/assignments]', err);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}, ['VENDOR', 'PLANNER', 'ADMIN']);
