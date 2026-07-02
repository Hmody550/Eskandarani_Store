/**
 * DELETE /api/cart/remove?lineId=xxx
 */
import { NextRequest, NextResponse } from 'next/server'
import { cartService } from '@/server/services/cart.service'
import { getCartContext } from '@/server/lib/cart-context'

export async function DELETE(req: NextRequest) {
  try {
    const lineId = req.nextUrl.searchParams.get('lineId')
    if (!lineId) return NextResponse.json({ error: 'معرّف العنصر مطلوب' }, { status: 400 })
    const ctx = await getCartContext()
    const lines = await cartService.remove(ctx, lineId)
    const summary = cartService.computeSummary(lines)
    return NextResponse.json({ lines, summary })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'فشل الحذف' }, { status: 400 })
  }
}
