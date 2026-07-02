/**
 * POST /api/auth/logout
 * Clears session cookie and deletes session from DB
 */
import { NextResponse } from 'next/server'
import { adminLogout } from '@/server/services/auth.service'

export async function POST() {
  try {
    await adminLogout()
    return NextResponse.json({ success: true, message: 'تم تسجيل الخروج' })
  } catch (e: any) {
    return NextResponse.json({ error: 'فشل تسجيل الخروج' }, { status: 500 })
  }
}
