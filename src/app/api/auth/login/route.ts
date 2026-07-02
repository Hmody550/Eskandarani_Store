/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user } on success, { error } on failure
 * Sets: HTTP-only session cookie
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminLogin } from '@/server/services/auth.service'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

// Rate limiting (simple in-memory — production should use Redis)
const attempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    const now = Date.now()
    const record = attempts.get(ip)
    if (record && now - record.lastAttempt < WINDOW_MS && record.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'تم تجاوز عدد المحاولات المسموح. حاول بعد 15 دقيقة.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }

    const result = await adminLogin(parsed.data.email, parsed.data.password)
    if (!result) {
      // Track failed attempt
      const current = attempts.get(ip)
      if (current && now - current.lastAttempt < WINDOW_MS) {
        attempts.set(ip, { count: current.count + 1, lastAttempt: now })
      } else {
        attempts.set(ip, { count: 1, lastAttempt: now })
      }
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Clear failed attempts on success
    attempts.delete(ip)

    return NextResponse.json({
      user: result.user,
      message: 'تم تسجيل الدخول بنجاح',
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: 'فشل تسجيل الدخول' },
      { status: 500 }
    )
  }
}
