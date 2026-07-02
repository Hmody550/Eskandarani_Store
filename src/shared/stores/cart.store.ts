/**
 * Cart Store — client-side cache of cart lines + optimistic UI helpers.
 * Source of truth is the server; this mirrors for instant UI feedback.
 */
import { create } from 'zustand'
import type { CartLine, CartSummary } from '@/types'

interface CartState {
  lines: CartLine[]
  summary: CartSummary | null
  isLoading: boolean
  couponCode: string | null
  couponDiscount: number
  couponFreeShipping: boolean
  couponMessage: string | null

  setLines: (lines: CartLine[]) => void
  setSummary: (summary: CartSummary | null) => void
  setLoading: (loading: boolean) => void
  setCoupon: (code: string | null, discount: number, freeShipping: boolean, message: string | null) => void
  reset: () => void

  // Optimistic helpers
  optimisticUpdateQty: (lineId: string, quantity: number) => void
  optimisticRemove: (lineId: string) => void
  optimisticAdd: (line: CartLine) => void
}

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  summary: null,
  isLoading: false,
  couponCode: null,
  couponDiscount: 0,
  couponFreeShipping: false,
  couponMessage: null,

  setLines: (lines) => set({ lines }),
  setSummary: (summary) => set({ summary }),
  setLoading: (isLoading) => set({ isLoading }),
  setCoupon: (couponCode, couponDiscount, couponFreeShipping, couponMessage) =>
    set({ couponCode, couponDiscount, couponFreeShipping, couponMessage }),
  reset: () => set({
    lines: [], summary: null, couponCode: null, couponDiscount: 0,
    couponFreeShipping: false, couponMessage: null,
  }),

  optimisticUpdateQty: (lineId, quantity) =>
    set((state) => {
      const lines = state.lines.map(l => l.id === lineId ? { ...l, quantity } : l)
      const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
      const summary = state.summary ? {
        ...state.summary,
        subtotal,
        total: Math.max(0, subtotal - state.couponDiscount + state.summary.shippingCost + state.summary.tax),
        itemCount: lines.reduce((s, l) => s + l.quantity, 0),
      } : null
      return { lines, summary }
    }),

  optimisticRemove: (lineId) =>
    set((state) => {
      const lines = state.lines.filter(l => l.id !== lineId)
      const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
      const summary = state.summary ? {
        ...state.summary,
        subtotal,
        total: Math.max(0, subtotal - state.couponDiscount + state.summary.shippingCost + state.summary.tax),
        itemCount: lines.reduce((s, l) => s + l.quantity, 0),
      } : null
      return { lines, summary }
    }),

  optimisticAdd: (line) =>
    set((state) => {
      const existing = state.lines.find(l => l.productId === line.productId && l.variantId === line.variantId)
      let lines: CartLine[]
      if (existing) {
        lines = state.lines.map(l => l.id === existing.id ? { ...l, quantity: l.quantity + line.quantity } : l)
      } else {
        lines = [line, ...state.lines]
      }
      const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
      const summary = state.summary ? {
        ...state.summary,
        subtotal,
        total: Math.max(0, subtotal - state.couponDiscount + state.summary.shippingCost + state.summary.tax),
        itemCount: lines.reduce((s, l) => s + l.quantity, 0),
      } : { subtotal, discount: 0, shippingCost: 0, tax: 0, total: subtotal, currency: 'EGP', itemCount: lines.length, totalSavings: 0 }
      return { lines, summary }
    }),
}))
