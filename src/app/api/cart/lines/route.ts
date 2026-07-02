/**
 * GET /api/cart/lines
 */
import { NextResponse } from 'next/server'
import { cartService } from '@/server/services/cart.service'
import { getCartContext, ensureGuestToken } from '@/server/lib/cart-context'

export async function GET() {
  const ctx = await getCartContext()
  if (!ctx.userId && !ctx.guestToken) {
    return NextResponse.json({ lines: [], summary: null })
  }
  const lines = await cartService.getLines(ctx)
  const summary = cartService.computeSummary(lines)
  return NextResponse.json({ lines, summary })
}

export const dynamic = 'force-dynamic'
