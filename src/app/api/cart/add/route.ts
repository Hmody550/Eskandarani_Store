/**
 * POST /api/cart/add { productId, variantId?, quantity }
 */
import { NextRequest, NextResponse } from 'next/server'
import { cartService } from '@/server/services/cart.service'
import { getCartContext, ensureGuestToken } from '@/server/lib/cart-context'
import { z } from 'zod'

const schema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(99),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
    }
    const ctx = await getCartContext()
    const res = NextResponse.json({})
    if (!ctx.userId && !ctx.guestToken) {
      ctx.guestToken = await ensureGuestToken(res)
    }
    const lines = await cartService.add(ctx, parsed.data.productId, parsed.data.variantId ?? null, parsed.data.quantity)
    const summary = cartService.computeSummary(lines)
    // Build the final response WITH the cookie (if newly set) + the data
    return NextResponse.json({ lines, summary }, {
      headers: res.headers,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'فشل إضافة المنتج' }, { status: 400 })
  }
}
