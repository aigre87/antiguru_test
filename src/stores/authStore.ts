'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthResponse } from '@/lib/schemas';

type UserInfo = Omit<AuthResponse, 'accessToken' | 'refreshToken'>;

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  setAuth: (auth: AuthResponse, remember: boolean) => void;
  logout: () => void;
  _hydrated: boolean;
  setHydrated: () => void;
}

function extractUser(auth: AuthResponse): UserInfo {
  return {
    id: auth.id,
    username: auth.username,
    email: auth.email,
    firstName: auth.firstName,
    lastName: auth.lastName,
    gender: auth.gender,
    image: auth.image,
  };
}

/**
 * Persistent auth store (localStorage).
 * Only persists when rememberMe=true.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      rememberMe: false,
      _hydrated: false,
      setHydrated: () => set({ _hydrated: true }),
      setAuth: (auth, remember) => {
        if (remember) {
          // Persist to localStorage
          set({
            token: auth.accessToken,
            user: extractUser(auth),
            isAuthenticated: true,
            rememberMe: true,
          });
        } else {
          // Clear localStorage, use sessionStorage instead
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            rememberMe: false,
          });
          // Store in sessionStorage
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(
              'session-auth',
              JSON.stringify({
                token: auth.accessToken,
                user: extractUser(auth),
                isAuthenticated: true,
              })
            );
          }
        }
      },
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          rememberMe: false,
        });
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('session-auth');
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

/**
 * Helper to get session auth from sessionStorage (for non-remember-me sessions).
 * Session dies when tab/browser is closed.
 */
export function getSessionAuth(): { token: string; user: UserInfo; isAuthenticated: boolean } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('session-auth');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Hook: returns true if user is authenticated via either localStorage or sessionStorage.
 */
export function useIsAuthenticated(): boolean {
  const persistent = useAuthStore((s) => s.isAuthenticated);
  const rememberMe = useAuthStore((s) => s.rememberMe);
  const hydrated = useAuthStore((s) => s._hydrated);

  if (!hydrated) return false;

  if (rememberMe && persistent) return true;

  const session = getSessionAuth();
  return session?.isAuthenticated ?? false;
}

/**
 * Hook: returns current user from either store.
 */
export function useCurrentUser(): UserInfo | null {
  const persistent = useAuthStore();

  if (persistent.rememberMe && persistent.isAuthenticated) {
    return persistent.user;
  }

  const session = getSessionAuth();
  return session?.user ?? null;
}

/**
 * Hook: returns current token from either store.
 */
export function useCurrentToken(): string | null {
  const persistent = useAuthStore();

  if (persistent.rememberMe && persistent.isAuthenticated) {
    return persistent.token;
  }

  const session = getSessionAuth();
  return session?.token ?? null;
}
