// src/app/api/auth/register/route.ts
import { signAccessToken, signRefreshToken, storeRefreshToken, type JWTPayload } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, role, businessName, category } = body as {
      email: string; password: string; firstName: string; lastName: string;
      role: 'VENDOR' | 'PLANNER' | 'CLIENT' | 'ADMIN';
      businessName?: string; category?: string;
    };

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'email, password, firstName, lastName, and role are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (role === 'VENDOR' && (!businessName || !category)) {
      return NextResponse.json({ error: 'businessName and category are required for VENDOR accounts' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, passwordHash, firstName, lastName, role },
      });

      let vendorId:  string | null = null;
      let plannerId: string | null = null;

      if (role === 'VENDOR') {
        const vendor = await tx.vendor.create({
          data: { userId: user.id, businessName: businessName!, category: category! },
        });
        vendorId = vendor.id;
      }

      if (role === 'PLANNER') {
        const planner = await tx.plannerProfile.create({
          // FIX: PlannerProfile has no @default(uuid()) — must supply id + updatedAt
          data: { id: crypto.randomUUID(), userId: user.id, updatedAt: new Date() },
        });
        plannerId = planner.id;
      }

      return { user, vendorId, plannerId };
    });

    const payload: JWTPayload = {
      sub:       result.user.id,
      email:     result.user.email,
      role:      result.user.role,
      firstName: result.user.firstName,
      lastName:  result.user.lastName,
      ...(result.vendorId  ? { vendorId:  result.vendorId  } : {}),
      ...(result.plannerId ? { plannerId: result.plannerId } : {}),
    };

    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(result.user.id);
    await storeRefreshToken(result.user.id, refreshToken);

    return NextResponse.json({
      user: {
        id: result.user.id, email: result.user.email,
        firstName: result.user.firstName, lastName: result.user.lastName,
        role: result.user.role, vendorId: result.vendorId, plannerId: result.plannerId,
      },
      accessToken,
      refreshToken,
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/auth/register]', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
