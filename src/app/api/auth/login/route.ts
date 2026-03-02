// src/app/api/auth/login/route.ts
// POST /api/auth/login
// Verifies email + password. Looks up vendor/planner profile IDs.
// Issues a fresh access token + refresh token pair.

import {
  signAccessToken,
  signRefreshToken,
  storeRefreshToken,
  type JWTPayload,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: 'email and password are required' },
        { status: 400 }
      );
    }

    // ── Find user + related profiles in one query ───────────────────────────
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        vendorProfile:  { select: { id: true } },
        plannerProfile: { select: { id: true } },
      },
    });

    if (!user) {
      // Use a generic message — don't reveal whether email exists
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'This account has been deactivated' },
        { status: 403 }
      );
    }

    // ── Verify password ─────────────────────────────────────────────────────
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ── Build token payload ─────────────────────────────────────────────────
    const vendorId  = user.vendorProfile?.id  ?? null;
    const plannerId = user.plannerProfile?.id ?? null;

    const payload: JWTPayload = {
      sub:       user.id,
      email:     user.email,
      role:      user.role,
      firstName: user.firstName,
      lastName:  user.lastName,
      ...(vendorId  ? { vendorId  } : {}),
      ...(plannerId ? { plannerId } : {}),
    };

    // ── Issue tokens ────────────────────────────────────────────────────────
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    return NextResponse.json({
      user: {
        id:        user.id,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        role:      user.role,
        vendorId,
        plannerId,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
