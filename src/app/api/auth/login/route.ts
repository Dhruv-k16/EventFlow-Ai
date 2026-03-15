// src/app/api/auth/login/route.ts
import { signAccessToken, signRefreshToken, storeRefreshToken, type JWTPayload } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        vendorProfile:  { select: { id: true } },
        PlannerProfile: { select: { id: true } }, // FIX: was plannerProfile
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    if (!user.isActive) {
      return NextResponse.json({ error: 'This account has been deactivated' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // FIX: use PlannerProfile (PascalCase) to match schema relation name
    const vendorId  = user.vendorProfile?.id  ?? null;
    const plannerId = user.PlannerProfile?.id ?? null;

    const payload: JWTPayload = {
      sub:       user.id,
      email:     user.email,
      role:      user.role,
      firstName: user.firstName,
      lastName:  user.lastName,
      ...(vendorId  ? { vendorId  } : {}),
      ...(plannerId ? { plannerId } : {}),
    };

    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    return NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, vendorId, plannerId },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
