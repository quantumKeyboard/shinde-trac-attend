import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      clearAuth: () => set({ user: null, session: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useOfflineStore = create(
  persist(
    (set, get) => ({
      pendingAttendance: [],
      addPendingAttendance: (attendance) =>
        set((state) => ({
          pendingAttendance: [...state.pendingAttendance, attendance],
        })),
      removePendingAttendance: (id) =>
        set((state) => ({
          pendingAttendance: state.pendingAttendance.filter((a) => a.id !== id),
        })),
      clearPendingAttendance: () => set({ pendingAttendance: [] }),
    }),
    {
      name: 'offline-storage',
    }
  )
);
