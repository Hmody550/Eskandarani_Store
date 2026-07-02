/**
 * Auth Store — tracks admin session state on client side.
 * Server is source of truth (cookie + DB); this mirrors for instant UI.
 */
import { create } from 'zustand'

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
}

interface AuthState {
  user: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean

  setUser: (user: AdminUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // Start as loading until session is checked
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}))
