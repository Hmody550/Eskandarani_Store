/**
 * GET  /api/orders/[orderNumber]?email=xxx — get order by number (guest needs email)
 * GET  /api/orders — list current user's orders
 * POST /api/orders/reorder { orderId }
 * POST /api/orders/cancel { orderId, reason }
 */
import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/server/services/order.service'
import { getCartContext } from '@/server/lib/cart-context'

export async function GET(req: NextRequest) {
  try {
    const { orderNumber } = { orderNumber: req.nextUrl.searchParams.get('orderNumber') }
    if (orderNumber) {
      const email = req.nextUrl.searchParams.get('email') ?? undefined
      const order = await orderService.getByNumber(orderNumber, email ?? undefined)
      if (!order) return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
      return NextResponse.json({ order })
    }
    return NextResponse.json({ error: 'رقم الطلب مطلوب' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'فشل' }, { status: 400 })
  }
}
