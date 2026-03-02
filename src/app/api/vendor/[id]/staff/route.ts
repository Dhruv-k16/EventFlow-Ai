// src/app/api/vendor/[id]/staff/route.ts
// GET  /api/vendor/:id/staff               — list all staff for a vendor (public)
// POST /api/vendor/:id/staff               — add a new staff member (vendor/admin only)
//
// Staff belong to a vendor. Vendors can only manage their own staff.
// Status: AVAILABLE | ON_SITE | ON_LEAVE

import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type StaffRow = {
  id:        string;
  vendorId:  string;
  name:      string;
  role:      string;
  wage:      number | { toString(): string };
  status:    string;
  createdAt: Date;
  updatedAt: Date;
};

function fmt(s: StaffRow) {
  return {
    id:        s.id,
    vendorId:  s.vendorId,
    name:      s.name,
    role:      s.role,
    wage:      Number(s.wage),
    status:    s.status,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

// ── GET — public ──────────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');

  try {
    const vendor = await prisma.vendor.findUnique({
      where:  { id },
      select: { id: true },
    });
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    const staff = await prisma.staff.findMany({
      where: {
        vendorId: id,
        ...(statusFilter ? { status: statusFilter as any } : {}),
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json((staff as StaffRow[]).map(fmt));
  } catch (err) {
    console.error('[GET /api/vendor/[id]/staff]', err);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// ── POST — vendor/admin only ──────────────────────────────────────────────────
export const POST = withAuth<{ id: string }>(
  async (req, ctx, user) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    if (user.role === 'VENDOR' && user.vendorId !== id) {
      return NextResponse.json({ error: 'You can only manage your own staff' }, { status: 403 });
    }

    try {
      const body = await req.json();
      const { name, role, wage, status } = body as {
        name:    string;
        role:    string;
        wage:    number;
        status?: string;
      };

      if (!name?.trim() || !role?.trim() || wage === undefined) {
        return NextResponse.json(
          { error: 'name, role, and wage are required' },
          { status: 400 }
        );
      }
      if (wage < 0) {
        return NextResponse.json({ error: 'wage cannot be negative' }, { status: 400 });
      }

      const vendor = await prisma.vendor.findUnique({ where: { id }, select: { id: true } });
      if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

      const member = await prisma.staff.create({
        data: {
          vendorId: id,
          name:     name.trim(),
          role:     role.trim(),
          wage,
          status:   (status as any) ?? 'AVAILABLE',
        },
      });

      return NextResponse.json(fmt(member as StaffRow), { status: 201 });
    } catch (err) {
      console.error('[POST /api/vendor/[id]/staff]', err);
      return NextResponse.json({ error: 'Failed to add staff member' }, { status: 500 });
    }
  },
  ['VENDOR', 'ADMIN']
);
