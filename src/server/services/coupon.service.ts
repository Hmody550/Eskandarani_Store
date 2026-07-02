/**
 * Coupon Service — validates coupons and computes discounts.
 */
import { db } from '@/lib/db'
import type { CouponResult } from '@/types'

export const couponService = {
  async validate(code: string, subtotal: number, userId?: string): Promise<CouponResult> {
    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } })

    if (!coupon || !coupon.isActive) {
      return { valid: false, code, discount: 0, freeShipping: false, message: 'كود الخصم غير صالح' }
    }
    const now = new Date()
    if (now < coupon.startsAt) {
      return { valid: false, code, discount: 0, freeShipping: false, message: 'الكود لم يبدأ بعد' }
    }
    if (coupon.endsAt && now > coupon.endsAt) {
      return { valid: false, code, discount: 0, freeShipping: false, message: 'انتهت صلاحية الكود' }
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, code, discount: 0, freeShipping: false, message: 'تم استخدام الكود بالكامل' }
    }
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      return { valid: false, code, discount: 0, freeShipping: false, message: `الحد الأدنى للطلب: ${coupon.minSubtotal} ج.م` }
    }

    let discount = 0
    let freeShipping = false

    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round((subtotal * coupon.value) / 100)
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    } else if (coupon.type === 'FIXED') {
      discount = Math.min(coupon.value, subtotal)
    } else if (coupon.type === 'FREE_SHIPPING') {
      freeShipping = true
    }

    return {
      valid: true,
      code: coupon.code,
      discount,
      freeShipping,
      message: freeShipping ? 'تم تطبيق الشحن المجاني' : `تم تطبيق خصم ${discount} ج.م`,
    }
  },

  async incrementUsage(code: string): Promise<void> {
    await db.coupon.update({ where: { code }, data: { usedCount: { increment: 1 } } })
  },

  async listActive() {
    return db.coupon.findMany({ where: { isActive: true, endsAt: { gt: new Date() } } })
  },
}
