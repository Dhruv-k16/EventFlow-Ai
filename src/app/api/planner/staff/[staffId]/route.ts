// src/app/api/planner/staff/[staffId]/route.ts
// GET    /api/planner/staff/:staffId  → get single member
// PATCH  /api/planner/staff/:staffId  → update name/role/email/phone/status
// DELETE /api/planner/staff/:staffId  → remove team member

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PlannerStaffStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const STATUS_MAP: Record<string, PlannerStaffStatus> = {
  'Available': PlannerStaffStatus.AVAILABLE,
  'Busy':      PlannerStaffStatus.BUSY,
  'On Leave':  PlannerStaffStatus.ON_LEAVE,
};

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

// Helper: verify the staff member belongs to the requesting planner
async function getOwnedMember(staffId: string, userId: string) {
  const planner = await prisma.plannerProfile.findUnique({
    where:  { userId },
    select: { id: true },
  });
  if (!planner) return null;

  const member = await prisma.plannerStaff.findFirst({
    where: { id: staffId, plannerProfileId: planner.id },
  });
  return member;
}

// ── GET ───────────────────────────────────────────────────────────────────────
export const GET = withAuth(
  async (_req: NextRequest, ctx, user) => {
    const { staffId } = await (ctx.params as unknown as Promise<{ staffId: string }>);
    try {
      const member = await getOwnedMember(staffId, user.sub);
      if (!member) {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
      }
      return NextResponse.json(fmt(member));
    } catch (err) {
      console.error('[GET /api/planner/staff/:staffId]', err);
      return NextResponse.json({ error: 'Failed to fetch staff member' }, { status: 500 });
    }
  },
  ['PLANNER', 'ADMIN']
);

// ── PATCH — update member details or status ────────────────────────────────
export const PATCH = withAuth(
  async (req: NextRequest, ctx, user) => {
    const { staffId } = await (ctx.params as unknown as Promise<{ staffId: string }>);
    try {
      const existing = await getOwnedMember(staffId, user.sub);
      if (!existing) {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
      }

      const body = await req.json();
      const { name, role, email, phone, status, assignedEvents } = body as {
        name?:           string;
        role?:           string;
        email?:          string;
        phone?:          string;
        status?:         string;
        assignedEvents?: number;
      };

      const updated = await prisma.plannerStaff.update({
        where: { id: staffId },
        data:  {
          ...(name           !== undefined && { name:           name.trim() }),
          ...(role           !== undefined && { role:           role.trim() }),
          ...(email          !== undefined && { email:          email?.trim() ?? null }),
          ...(phone          !== undefined && { phone:          phone?.trim() ?? null }),
          ...(status         !== undefined && STATUS_MAP[status] && { status: STATUS_MAP[status] }),
          ...(assignedEvents !== undefined && { assignedEvents: Math.max(0, assignedEvents) }),
        },
      });

      return NextResponse.json(fmt(updated));
    } catch (err) {
      console.error('[PATCH /api/planner/staff/:staffId]', err);
      return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
    }
  },
  ['PLANNER', 'ADMIN']
);

// ── DELETE ────────────────────────────────────────────────────────────────────
export const DELETE = withAuth(
  async (_req: NextRequest, ctx, user) => {
    const { staffId } = await (ctx.params as unknown as Promise<{ staffId: string }>);
    try {
      const existing = await getOwnedMember(staffId, user.sub);
      if (!existing) {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
      }

      await prisma.plannerStaff.delete({ where: { id: staffId } });
      return NextResponse.json({ success: true, deletedId: staffId });
    } catch (err) {
      console.error('[DELETE /api/planner/staff/:staffId]', err);
      return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 });
    }
  },
  ['PLANNER', 'ADMIN']
);
