/**
 * AdminLoginPage — secure login page.
 * SECURITY: No credentials shown anywhere. No "demo" button. No hints.
 * Completely separate from the public store (no header/footer).
 */
'use client'

import { useState } from 'react'
import { useLogin } from '@/shared/hooks/auth-queries'
import { useUIStore } from '@/shared/stores/ui.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff, Loader2, Shield, ArrowRight, KeyRound, AlertCircle } from 'lucide-react'

export function AdminLoginPage() {
  const login = useLogin()
  const { setView } = useUIStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول')
      return
    }
    await login.mutateAsync({ email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden gradient-premium p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-dots-pattern opacity-[0.04]" />
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-gold/15 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gold/10 blur-3xl" />

      {/* Animated gold rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full border border-gold/10 pointer-events-none"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute size-1.5 rounded-full bg-gold/40"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 30}deg) translateY(-300px)`,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative size-24 mx-auto mb-4 rounded-full overflow-hidden shadow-glow ring-4 ring-gold/30"
          >
            <img src="/askandarani-brand-logo.svg" alt="أسكندراني فون" className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="font-display text-3xl font-extrabold gradient-text mb-1">أسكندراني فون</h1>
          <p className="text-xs text-muted-foreground tracking-[0.3em] uppercase">Admin Panel</p>
        </div>

        {/* Login card */}
        <div className="glass-gold rounded-3xl p-6 lg:p-8 shadow-elevated border-gold">
          <div className="flex items-center gap-2 mb-6">
            <div className="size-10 rounded-xl gradient-gold grid place-items-center">
              <Shield className="size-5 text-gold-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg">لوحة التحكم الآمنة</h2>
              <p className="text-xs text-muted-foreground">دخول المسؤولين فقط</p>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</Label>
              <div className="relative mt-1">
                <Mail className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  className="pr-9 h-12"
                  dir="ltr"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">كلمة المرور</Label>
              <div className="relative mt-1">
                <Lock className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-9 pl-9 h-12"
                  dir="ltr"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 gap-2 gradient-gold text-gold-foreground shadow-gold hover:shadow-glow"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <><Loader2 className="size-5 animate-spin" /> جاري التحقق...</>
              ) : (
                <><KeyRound className="size-5" /> دخول آمن</>
              )}
            </Button>
          </form>

          {/* SECURITY: No demo credentials button, no hints, no email/password shown */}
        </div>

        {/* Back to store */}
        <div className="text-center mt-6">
          <button
            onClick={() => setView('home')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowRight className="size-4" />
            العودة للمتجر
          </button>
        </div>

        {/* Security badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="size-3 text-success" /> SSL مشفر
          </span>
          <span className="flex items-center gap-1">
            <Lock className="size-3 text-success" /> جلسة آمنة
          </span>
          <span className="flex items-center gap-1">
            <KeyRound className="size-3 text-success" /> حماية من الاختراق
          </span>
        </div>
      </motion.div>
    </div>
  )
}
