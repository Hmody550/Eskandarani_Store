/**
 * GET /api/auth/session
 * Returns current admin session if authenticated, null otherwise
 */
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/server/services/auth.service'

export async function GET() {
  try {
    const user = await getAdminSession()
    if (!user) {
      return NextResponse.json({ user: null })
    }
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}

export const dynamic = 'force-dynamic'
