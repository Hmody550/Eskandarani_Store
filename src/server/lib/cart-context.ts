/**
 * Cart API helpers — get context (userId from cookie or guestToken)
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export interface CartCtx {
  userId?: string
  guestToken?: string
}

export async function getCartContext(): Promise<CartCtx> {
  const c = await cookies()
  const token = c.get('guest-token')?.value
  if (token) return { guestToken: token }
  return {}
}

export async function ensureGuestToken(res: NextResponse): Promise<string> {
  const c = await cookies()
  let token = c.get('guest-token')?.value
  if (!token) {
    token = `gst_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
    res.cookies.set('guest-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  }
  return token!
}
