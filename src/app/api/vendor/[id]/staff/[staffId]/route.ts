// src/app/api/vendor/[id]/staff/[staffId]/route.ts
// GET    /api/vendor/:id/staff/:staffId — get staff member + assignment history
// PATCH  /api/vendor/:id/staff/:staffId — update name, role, wage, status
// DELETE /api/vendor/:id/staff/:staffId — remove staff member

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type Params = { id: string; staffId: string };

// ── GET ───────────────────────────────────────────────────────────────────────
export const GET = withAuth(
  async (_req: NextRequest, ctx) => {
    const { id, staffId } = await (ctx.params as unknown as Promise<Params>);

    try {
      const member = await prisma.staff.findUnique({
        where:   { id: staffId },
        include: {
          assignments: {
            include: { event: { select: { id: true, name: true, startDate: true, endDate: true } } },
            orderBy: { startTime: 'desc' },
          },
        },
      });

      if (!member) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
      if (member.vendorId !== id) return NextResponse.json({ error: 'Staff member does not belong to this vendor' }, { status: 403 });

      return NextResponse.json({
        id:        member.id,
        vendorId:  member.vendorId,
        name:      member.name,
        role:      member.role,
        wage:      Number(member.wage),
        status:    member.status,
        createdAt: member.createdAt.toISOString(),
        updatedAt: member.updatedAt.toISOString(),
        assignments: member.assignments.map(a => ({
          id:        a.id,
          eventId:   a.eventId,
          event:     {
            id:        a.event.id,
            name:      a.event.name,
            startDate: a.event.startDate.toISOString().split('T')[0],
            endDate:   a.event.endDate.toISOString().split('T')[0],
          },
          startTime: a.startTime.toISOString(),
          endTime:   a.endTime.toISOString(),
        })),
      });
    } catch (err) {
      console.error('[GET /api/vendor/[id]/staff/[staffId]]', err);
      return NextResponse.json({ error: 'Failed to fetch staff member' }, { status: 500 });
    }
  }
);

// ── PATCH — vendor/admin only ─────────────────────────────────────────────────
export const PATCH = withAuth<Params>(
  async (req, ctx, user) => {
    const { id, staffId } = await (ctx.params as unknown as Promise<Params>);

    if (user.role === 'VENDOR' && user.vendorId !== id) {
      return NextResponse.json({ error: 'You can only manage your own staff' }, { status: 403 });
    }

    try {
      const member = await prisma.staff.findUnique({ where: { id: staffId } });
      if (!member) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
      if (member.vendorId !== id) return NextResponse.json({ error: 'Staff does not belong to this vendor' }, { status: 403 });

      const body = await req.json();
      const { name, role, wage, status } = body;

      const updateData: Record<string, unknown> = {};
      if (name   !== undefined) updateData.name   = name.trim();
      if (role   !== undefined) updateData.role   = role.trim();
      if (wage   !== undefined) {
        if (wage < 0) return NextResponse.json({ error: 'wage cannot be negative' }, { status: 400 });
        updateData.wage = wage;
      }
      if (status !== undefined) updateData.status = status;

      const updated = await prisma.staff.update({
        where: { id: staffId },
        data:  updateData,
      });

      return NextResponse.json({
        id:        updated.id,
        vendorId:  updated.vendorId,
        name:      updated.name,
        role:      updated.role,
        wage:      Number(updated.wage),
        status:    updated.status,
        updatedAt: updated.updatedAt.toISOString(),
      });
    } catch (err) {
      console.error('[PATCH /api/vendor/[id]/staff/[staffId]]', err);
      return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
    }
  },
  ['VENDOR', 'ADMIN']
);

// ── DELETE — vendor/admin only ────────────────────────────────────────────────
export const DELETE = withAuth<Params>(
  async (_req: NextRequest, ctx, user) => {
    const { id, staffId } = await (ctx.params as unknown as Promise<Params>);

    if (user.role === 'VENDOR' && user.vendorId !== id) {
      return NextResponse.json({ error: 'You can only manage your own staff' }, { status: 403 });
    }

    try {
      const member = await prisma.staff.findUnique({
        where:   { id: staffId },
        include: { assignments: { select: { id: true } } },
      });
      if (!member) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
      if (member.vendorId !== id) return NextResponse.json({ error: 'Staff does not belong to this vendor' }, { status: 403 });

      // Delete assignments first (cascade)
      if (member.assignments.length > 0) {
        await prisma.staffAssignment.deleteMany({ where: { staffId } });
      }

      await prisma.staff.delete({ where: { id: staffId } });

      return NextResponse.json({ success: true, deletedStaffId: staffId });
    } catch (err) {
      console.error('[DELETE /api/vendor/[id]/staff/[staffId]]', err);
      return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 });
    }
  },
  ['VENDOR', 'ADMIN']
);
