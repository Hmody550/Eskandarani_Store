/**
 * POST /api/cart/coupon { code }
 * DELETE /api/cart/coupon
 */
import { NextRequest, NextResponse } from 'next/server'
import { cartService } from '@/server/services/cart.service'
import { couponService } from '@/server/services/coupon.service'
import { getCartContext } from '@/server/lib/cart-context'
import { z } from 'zod'

const schema = z.object({ code: z.string().min(1) })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'الكود مطلوب' }, { status: 400 })

    const ctx = await getCartContext()
    const lines = await cartService.getLines(ctx)
    if (lines.length === 0) return NextResponse.json({ error: 'السلة فارغة' }, { status: 400 })

    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
    const result = await couponService.validate(parsed.data.code, subtotal, ctx.userId)
    if (!result.valid) return NextResponse.json({ error: result.message }, { status: 400 })

    await cartService.applyCoupon(ctx, result.code)
    return NextResponse.json({ ...result, summary: cartService.computeSummary(lines, {
      discount: result.discount,
      freeShipping: result.freeShipping,
    }) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'فشل تطبيق الكود' }, { status: 400 })
  }
}

export async function DELETE() {
  try {
    const ctx = await getCartContext()
    await cartService.removeCoupon(ctx)
    const lines = await cartService.getLines(ctx)
    const summary = cartService.computeSummary(lines)
    return NextResponse.json({ summary })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'فشل إزالة الكود' }, { status: 400 })
  }
}
