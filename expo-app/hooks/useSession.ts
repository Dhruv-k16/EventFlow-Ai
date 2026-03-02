// expo-app/hooks/useSession.ts
// Manages reading / writing the current user session from SecureStore.
// Import this hook wherever you need the logged-in user's identity.

import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { UserSession } from '../../services/dataStore';

const SESSION_KEY = 'userSession'; // single JSON blob — one read/write

export function useSession() {
  const [session, setSession]   = useState<UserSession | null>(null);
  const [loading, setLoading]   = useState(true);

  // ── Read ────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (raw) setSession(JSON.parse(raw) as UserSession);
      } catch (e) {
        console.warn('[useSession] Failed to read session:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Write ───────────────────────────────────────────────────────────────
  const saveSession = useCallback(async (s: UserSession) => {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  }, []);

  // ── Clear (logout) ──────────────────────────────────────────────────────
  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    // Keep legacy key in sync so index.tsx redirect still works
    await SecureStore.deleteItemAsync('userRole');
    setSession(null);
  }, []);

  return { session, loading, saveSession, clearSession };
}
