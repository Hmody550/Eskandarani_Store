/**
 * POST /api/shipping/options { lines, subtotal }
 */
import { NextRequest, NextResponse } from 'next/server'
import { shippingService } from '@/server/services/shipping.service'
import { z } from 'zod'

const schema = z.object({
  lines: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  subtotal: z.number(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
    const options = await shippingService.options(parsed.data.lines as any, parsed.data.subtotal)
    return NextResponse.json({ options })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'فشل تحميل خيارات الشحن' }, { status: 400 })
  }
}
