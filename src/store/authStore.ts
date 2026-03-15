import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Doctor } from '../types';

interface AuthState {
  user: Doctor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: Doctor) => void;
  register: (user: Doctor) => void;
  logout: () => void;
  setUser: (user: Doctor | null) => void;
  updateProfile: (updates: Partial<Doctor>) => void;
  setLoading: (isLoading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user: Doctor) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      register: (user: Doctor) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setUser: (user: Doctor | null) =>
        set({
          user,
          isAuthenticated: user !== null,
        }),

      updateProfile: (updates: Partial<Doctor>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (isLoading: boolean) =>
        set({ isLoading }),
    }),
    {
      name: 'orthosync-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
