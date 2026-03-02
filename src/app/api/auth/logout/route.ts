// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, revokeRefreshToken, revokeAllUserTokens } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken, allDevices = false } = body as {
      refreshToken: string;
      allDevices?:  boolean;
    };

    if (!refreshToken) {
      return NextResponse.json({ error: 'refreshToken is required' }, { status: 400 });
    }

    let userId: string | null = null;
    try {
      const decoded = verifyRefreshToken(refreshToken);
      userId = decoded.sub;
    } catch {
      // Token may be expired — still revoke by value
    }

    if (allDevices && userId) {
      await revokeAllUserTokens(userId);
    } else {
      await revokeRefreshToken(refreshToken);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/auth/logout]', err);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
