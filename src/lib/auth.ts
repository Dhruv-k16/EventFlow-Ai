// src/lib/auth.ts
// Self-hosted JWT auth layer.
// Access tokens: 15m | Refresh tokens: 7d stored in DB for revocation.

import { UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

// ── Config ───────────────────────────────────────────────────────────────────

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const ACCESS_TTL_SECONDS  = 15 * 60;        // 15 minutes
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in .env'
  );
}

// ── Payload shape ─────────────────────────────────────────────────────────────

export interface JWTPayload {
  sub:       string;   // userId
  email:     string;
  role:      UserRole;
  firstName: string;
  lastName:  string;
  // Vendor/Planner profile IDs — populated if relevant role
  vendorId?:  string;
  plannerId?: string;
}

// ── Token Generation ──────────────────────────────────────────────────────────

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_TTL_SECONDS,
    issuer:    'eventflow-ai',
    audience:  'eventflow-client',
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, jti: crypto.randomUUID() }, REFRESH_SECRET, {
    expiresIn: REFRESH_TTL_SECONDS,
    issuer:    'eventflow-ai',
    audience:  'eventflow-client',
  });
}

// ── Token Verification ────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, ACCESS_SECRET, {
    issuer:   'eventflow-ai',
    audience: 'eventflow-client',
  }) as JWTPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET, {
    issuer:   'eventflow-ai',
    audience: 'eventflow-client',
  }) as { sub: string };
}

// ── Refresh Token DB management ───────────────────────────────────────────────

export async function storeRefreshToken(
  userId: string,
  token: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);
  await prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token },
    data:  { isRevoked: true },
  });
}

export async function isRefreshTokenValid(token: string): Promise<boolean> {
  const record = await prisma.refreshToken.findUnique({
    where: { token },
  });
  if (!record) return false;
  if (record.isRevoked) return false;
  if (record.expiresAt < new Date()) return false;
  return true;
}

// Revoke all refresh tokens for a user (force logout all devices)
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data:  { isRevoked: true },
  });
}

// ── Route Handler Middleware ──────────────────────────────────────────────────

/**
 * Wraps a Next.js App Router route handler with JWT verification.
 * Injects the decoded payload into request headers for downstream use.
 *
 * Usage:
 *   export const GET = withAuth(async (req, ctx, user) => { ... });
 *   export const POST = withAuth(async (req, ctx, user) => { ... }, ['PLANNER', 'ADMIN']);
 */
export type AuthedHandler<P extends Record<string, string> = Record<string, string>> = (
  req: NextRequest,
  ctx: { params: P },
  user: JWTPayload
) => Promise<NextResponse> | NextResponse;

export function withAuth<P extends Record<string, string> = Record<string, string>>(
  handler: AuthedHandler<P>,
  allowedRoles?: UserRole[]
) {
  return async (
    req: NextRequest,
    ctx: { params: P }
  ): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('Authorization') ?? '';
      if (!authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Missing or malformed Authorization header' },
          { status: 401 }
        );
      }

      const token = authHeader.slice(7);
      let payload: JWTPayload;

      try {
        payload = verifyAccessToken(token);
      } catch {
        return NextResponse.json(
          { error: 'Invalid or expired access token' },
          { status: 401 }
        );
      }

      // Role guard
      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return NextResponse.json(
          { error: `Access denied. Required role: ${allowedRoles.join(' or ')}` },
          { status: 403 }
        );
      }

      return handler(req, ctx, payload);
    } catch (err) {
      console.error('[withAuth]', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

// ── Helper to get user from request headers (inside route handler) ─────────────
// Convenience to extract payload without re-verifying (already done by middleware)

export function extractUser(req: NextRequest): JWTPayload | null {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return null;
    return verifyAccessToken(authHeader.slice(7));
  } catch {
    return null;
  }
}
