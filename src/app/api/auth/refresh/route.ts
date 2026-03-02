// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  verifyRefreshToken, signAccessToken, signRefreshToken,
  isRefreshTokenValid, revokeRefreshToken, storeRefreshToken,
  type JWTPayload,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body as { refreshToken: string };

    if (!refreshToken) {
      return NextResponse.json({ error: 'refreshToken is required' }, { status: 400 });
    }

    let decoded: { sub: string };
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const isValid = await isRefreshTokenValid(refreshToken);
    if (!isValid) {
      return NextResponse.json({ error: 'Refresh token has been revoked or expired' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: {
        vendorProfile:  { select: { id: true } },
        plannerProfile: { select: { id: true } },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or account deactivated' }, { status: 401 });
    }

    await revokeRefreshToken(refreshToken);

    const payload: JWTPayload = {
      sub:       user.id,
      email:     user.email,
      role:      user.role,
      firstName: user.firstName,
      lastName:  user.lastName,
      ...(user.vendorProfile  ? { vendorId:  user.vendorProfile.id  } : {}),
      ...(user.plannerProfile ? { plannerId: user.plannerProfile.id } : {}),
    };

    const newAccessToken  = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(user.id);
    await storeRefreshToken(user.id, newRefreshToken);

    return NextResponse.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('[POST /api/auth/refresh]', err);
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
  }
}
