/**
 * PATCH /api/cart/update { lineId, quantity }
 */
import { NextRequest, NextResponse } from 'next/server'
import { cartService } from '@/server/services/cart.service'
import { getCartContext } from '@/server/lib/cart-context'
import { z } from 'zod'

const schema = z.object({
  lineId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
})

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
    const ctx = await getCartContext()
    const lines = await cartService.update(ctx, parsed.data.lineId, parsed.data.quantity)
    const summary = cartService.computeSummary(lines)
    return NextResponse.json({ lines, summary })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'فشل التحديث' }, { status: 400 })
  }
}
