import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { authApi, AuthResponse, isUnauthorized, requestWithRefresh } from "@/services/api";

type User = AuthResponse["user"];
type AuthState = {
  hydrated: boolean;
  accessToken: string | null;
  user: User | null;
  restore: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loadProfile: () => Promise<User>;
  logout: () => Promise<void>;
};

const refreshTokenKey = "refresh-token";
let activeRefresh: Promise<AuthResponse> | null = null;

async function refreshSession() {
  activeRefresh ??= SecureStore.getItemAsync(refreshTokenKey)
    .then((refreshToken) => {
      if (!refreshToken) throw new Error("Unauthorized");
      return authApi.refresh(refreshToken);
    })
    .finally(() => {
      activeRefresh = null;
    });
  return activeRefresh;
}

async function saveSession(result: AuthResponse, set: (state: Partial<AuthState>) => void) {
  await SecureStore.setItemAsync(refreshTokenKey, result.tokens.refreshToken);
  set({ accessToken: result.tokens.accessToken, user: result.user });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  accessToken: null,
  user: null,
  restore: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(refreshTokenKey);
      if (refreshToken) await saveSession(await authApi.refresh(refreshToken), set);
    } catch {
      await SecureStore.deleteItemAsync(refreshTokenKey);
      set({ accessToken: null, user: null });
    } finally {
      set({ hydrated: true });
    }
  },
  login: async (email, password) => saveSession(await authApi.login(email, password), set),
  register: async (email, password) => saveSession(await authApi.register(email, password), set),
  loadProfile: async () => {
    const accessToken = get().accessToken;
    if (!accessToken) throw new Error("Unauthorized");
    try {
      const profile = await requestWithRefresh({
        accessToken,
        request: (token) => authApi.me(token),
        refresh: async () => {
          const session = await refreshSession();
          await saveSession(session, set);
          return session.tokens.accessToken;
        },
      });
      set({ user: profile.user });
      return profile.user;
    } catch (error) {
      if (isUnauthorized(error)) {
        await SecureStore.deleteItemAsync(refreshTokenKey);
        set({ accessToken: null, user: null });
      }
      throw error;
    }
  },
  logout: async () => {
    const refreshToken = await SecureStore.getItemAsync(refreshTokenKey);
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      await SecureStore.deleteItemAsync(refreshTokenKey);
      set({ accessToken: null, user: null });
    }
  },
}));
