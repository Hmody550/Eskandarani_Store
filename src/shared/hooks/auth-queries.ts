/**
 * Auth hooks — login, logout, session checking.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/stores/auth.store'
import { useEffect } from 'react'
import { toast } from 'sonner'

// ============================================================
// Session check — auto-runs on app load
// ============================================================
export function useSession() {
  const { setUser, setLoading } = useAuthStore()
  const query = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/session')
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{ user: any }>
    },
    staleTime: 5 * 60 * 1000, // Check every 5 min
    retry: false,
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data.user)
    } else if (query.isError) {
      setUser(null)
    }
  }, [query.data, query.isError, setUser])

  return query
}

// ============================================================
// Login
// ============================================================
export function useLogin() {
  const qc = useQueryClient()
  const { setUser } = useAuthStore()
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول')
      return data
    },
    onSuccess: (data) => {
      setUser(data.user)
      qc.invalidateQueries({ queryKey: ['auth', 'session'] })
      toast.success('مرحباً بك', { description: data.user.name || data.user.email })
    },
    onError: (e: any) => {
      toast.error(e.message)
    },
  })
}

// ============================================================
// Logout
// ============================================================
export function useLogout() {
  const qc = useQueryClient()
  const { logout } = useAuthStore()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('فشل')
      return res.json()
    },
    onSuccess: () => {
      logout()
      qc.invalidateQueries({ queryKey: ['auth', 'session'] })
      qc.removeQueries({ queryKey: ['admin'] })
      toast.success('تم تسجيل الخروج')
    },
  })
}
