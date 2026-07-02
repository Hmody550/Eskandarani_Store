/**
 * POST /api/coupons/validate { code, subtotal }
 */
import { NextRequest, NextResponse } from 'next/server'
import { couponService } from '@/server/services/coupon.service'
import { z } from 'zod'

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
    const result = await couponService.validate(parsed.data.code, parsed.data.subtotal)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'فشل التحقق' }, { status: 400 })
  }
}
