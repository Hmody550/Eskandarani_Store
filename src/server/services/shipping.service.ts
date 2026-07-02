/**
 * Shipping Service — computes shipping cost per method and weight.
 */
import { db } from '@/lib/db'
import type { CartLine } from '@/types'

export interface ShippingOption {
  code: string
  name: string
  description: string | null
  cost: number
  estimatedDays: number
  isFree: boolean
  isRecommended: boolean
}

export const shippingService = {
  async options(lines: CartLine[], subtotal: number): Promise<ShippingOption[]> {
    const methods = await db.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    const totalWeight = lines.reduce((s, l) => s + 0.5 * l.quantity, 0) // 0.5kg per item placeholder

    return methods.map(m => {
      let cost = m.baseCost + Math.max(0, totalWeight - 1) * m.perKgCost
      let isFree = false
      // Free shipping threshold check
      if (m.freeShippingThreshold && subtotal >= m.freeShippingThreshold) {
        cost = 0
        isFree = true
      }
      if (m.minSubtotal && subtotal < m.minSubtotal) return null
      if (m.maxSubtotal && subtotal > m.maxSubtotal) return null
      return {
        code: m.code,
        name: m.name,
        description: m.description,
        cost: Math.max(0, Math.round(cost)),
        estimatedDays: m.estimatedDays,
        isFree,
        isRecommended: m.code === 'EXPRESS' || m.code === 'STANDARD',
      }
    }).filter(Boolean) as ShippingOption[]
  },

  async getByCode(code: string) {
    return db.shippingMethod.findUnique({ where: { code } })
  },
}
