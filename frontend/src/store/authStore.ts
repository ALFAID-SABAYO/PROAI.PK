import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authService from '../services/authService';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { access_token } = await authService.login(email, password);
          set({ token: access_token });
          const user = await authService.getMe();
          set({ user, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          await authService.register(payload);
          await get().login(payload.email, payload.password);
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: () => set({ user: null, token: null }),

      fetchUser: async () => {
        const { token } = get();
        if (!token) return;
        set({ isLoading: true });
        try {
          const user = await authService.getMe();
          set({ user, isLoading: false });
        } catch {
          set({ user: null, token: null, isLoading: false });
        }
      },
    }),
    {
      name: 'realestate-auth',
      partialize: (state) => ({ token: state.token }),
    },
  ),
);
