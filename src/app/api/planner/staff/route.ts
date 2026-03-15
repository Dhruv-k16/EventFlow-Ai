// src/app/api/planner/staff/route.ts
// GET  /api/planner/staff  → list all staff for the authenticated planner
// POST /api/planner/staff  → add a new team member

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PlannerStaffStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Map UI status strings → DB enum
const STATUS_MAP: Record<string, PlannerStaffStatus> = {
  'Available': PlannerStaffStatus.AVAILABLE,
  'Busy':      PlannerStaffStatus.BUSY,
  'On Leave':  PlannerStaffStatus.ON_LEAVE,
};

// Map DB enum → UI status strings
const STATUS_DISPLAY: Record<PlannerStaffStatus, string> = {
  AVAILABLE: 'Available',
  BUSY:      'Busy',
  ON_LEAVE:  'On Leave',
};

function fmt(member: any) {
  return {
    id:             member.id,
    name:           member.name,
    role:           member.role,
    email:          member.email,
    phone:          member.phone,
    status:         STATUS_DISPLAY[member.status as PlannerStaffStatus],
    assignedEvents: member.assignedEvents,
    // Compute initials for the UI avatar
    initials:       member.name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  };
}

// ── GET — list planner's staff ────────────────────────────────────────────────
export const GET = withAuth(async (_req: NextRequest, _ctx, user) => {
  try {
    // Resolve plannerProfileId from the JWT sub (userId)
    const planner = await prisma.plannerProfile.findUnique({
      where:  { userId: user.sub },
      select: { id: true },
    });

    if (!planner) {
      return NextResponse.json(
        { error: 'Planner profile not found for this account' },
        { status: 404 }
      );
    }

    const staff = await prisma.plannerStaff.findMany({
      where:   { plannerProfileId: planner.id },
      orderBy: { createdAt: 'asc' },
    });

    // Summary counts the UI stat cards need
    const summary = {
      total:     staff.length,
      available: staff.filter(s => s.status === 'AVAILABLE').length,
      busy:      staff.filter(s => s.status === 'BUSY').length,
      onLeave:   staff.filter(s => s.status === 'ON_LEAVE').length,
    };

    return NextResponse.json({ staff: staff.map(fmt), summary });
  } catch (err) {
    console.error('[GET /api/planner/staff]', err);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}, ['PLANNER', 'ADMIN']);

// ── POST — add a team member ──────────────────────────────────────────────────
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
  try {
    const body = await req.json();
    const { name, role, email, phone, status } = body as {
      name:    string;
      role:    string;
      email?:  string;
      phone?:  string;
      status?: string;
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    if (!role?.trim()) {
      return NextResponse.json({ error: 'role is required' }, { status: 400 });
    }

    // Resolve plannerProfileId
    const planner = await prisma.plannerProfile.findUnique({
      where:  { userId: user.sub },
      select: { id: true },
    });

    if (!planner) {
      return NextResponse.json(
        { error: 'Planner profile not found' },
        { status: 404 }
      );
    }

    const dbStatus: PlannerStaffStatus =
      (status && STATUS_MAP[status]) ? STATUS_MAP[status] : PlannerStaffStatus.AVAILABLE;

    const member = await prisma.plannerStaff.create({
      data: {
        plannerProfileId: planner.id,
        name:    name.trim(),
        role:    role.trim(),
        email:   email?.trim()  ?? null,
        phone:   phone?.trim()  ?? null,
        status:  dbStatus,
        assignedEvents: 0,
      },
    });

    return NextResponse.json(fmt(member), { status: 201 });
  } catch (err) {
    console.error('[POST /api/planner/staff]', err);
    return NextResponse.json({ error: 'Failed to add staff member' }, { status: 500 });
  }
}, ['PLANNER', 'ADMIN']);
