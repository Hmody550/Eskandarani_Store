/**
 * POST /api/orders/reorder { orderId }
 * POST /api/orders/cancel { orderId, reason }
 */
import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/server/services/order.service'
import { getCartContext } from '@/server/lib/cart-context'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = body.action
    if (action === 'reorder') {
      const parsed = z.object({ orderId: z.string() }).safeParse(body)
      if (!parsed.success) return NextResponse.json({ error: 'معرّف الطلب مطلوب' }, { status: 400 })
      const ctx = await getCartContext()
      const lines = await orderService.reorder(parsed.data.orderId, ctx)
      return NextResponse.json({ lines })
    }
    if (action === 'cancel') {
      const parsed = z.object({ orderId: z.string(), reason: z.string().min(2) }).safeParse(body)
      if (!parsed.success) return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
      const order = await orderService.cancel(parsed.data.orderId, parsed.data.reason)
      return NextResponse.json({ order })
    }
    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'فشل' }, { status: 400 })
  }
}
