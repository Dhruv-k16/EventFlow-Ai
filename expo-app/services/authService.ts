// expo-app/services/authService.ts
// All authentication flows for the mobile app.
// Stores the session (user + tokens) as a single JSON blob in SecureStore.
// apiFetch() is the ONLY function that should be used for authenticated API calls —
// it handles 401 → refresh → retry automatically.

import * as SecureStore from 'expo-secure-store';
import type { AuthResponse, StoredSession, UserRole } from '../../shared/types';

// ── Config ────────────────────────────────────────────────────────────────────
// Update this to your machine's local IP when developing, or your deployed URL.
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.138:3000/api';

const SESSION_KEY = 'ef_session';

// ── Session Storage ───────────────────────────────────────────────────────────

export async function getSession(): Promise<StoredSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export async function saveSession(session: StoredSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch {
    // Already cleared — ignore
  }
}

// ── Token Refresh ─────────────────────────────────────────────────────────────

async function attemptRefresh(session: StoredSession): Promise<StoredSession | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken: session.refreshToken }),
    });

    if (!res.ok) {
      // Refresh token is revoked or expired — force logout
      await clearSession();
      return null;
    }

    const { accessToken, refreshToken } = await res.json();
    const updated: StoredSession = { ...session, accessToken, refreshToken };
    await saveSession(updated);
    return updated;
  } catch {
    return null;
  }
}

// ── Authenticated Fetch ───────────────────────────────────────────────────────
// Use this for ALL authenticated API calls from the mobile app.
// Automatically refreshes the access token on 401 and retries once.

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await getSession();

  if (!session) {
    throw new Error('NOT_AUTHENTICATED');
  }

  const makeRequest = (token: string) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let response = await makeRequest(session.accessToken);

  // If 401, attempt token refresh then retry once
  if (response.status === 401) {
    const refreshed = await attemptRefresh(session);
    if (!refreshed) {
      // Refresh failed — caller should redirect to login
      throw new Error('SESSION_EXPIRED');
    }
    response = await makeRequest(refreshed.accessToken);
  }

  return response;
}

// ── Auth Actions ──────────────────────────────────────────────────────────────

export const AuthService = {
  async register(data: {
    email:         string;
    password:      string;
    firstName:     string;
    lastName:      string;
    role:          UserRole;
    businessName?: string;
    category?:     string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });

    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Registration failed');

    const session: StoredSession = {
      user:         body.user,
      accessToken:  body.accessToken,
      refreshToken: body.refreshToken,
    };
    await saveSession(session);
    return body as AuthResponse;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Login failed');

    const session: StoredSession = {
      user:         body.user,
      accessToken:  body.accessToken,
      refreshToken: body.refreshToken,
    };
    await saveSession(session);
    return body as AuthResponse;
  },

  async logout(allDevices = false): Promise<void> {
    const session = await getSession();
    if (session) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            refreshToken: session.refreshToken,
            allDevices,
          }),
        });
      } catch {
        // Even if server call fails, always clear local session
      }
    }
    await clearSession();
  },

  async getCurrentUser() {
    const session = await getSession();
    return session?.user ?? null;
  },
};
