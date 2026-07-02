/**
 * Wishlist & Compare stores — persisted client-side.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  productIds: string[]
  toggle: (productId: string) => void
  has: (productId: string) => boolean
  remove: (productId: string) => void
  clear: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((s) => ({
          productIds: s.productIds.includes(productId)
            ? s.productIds.filter(id => id !== productId)
            : [...s.productIds, productId],
        })),
      has: (productId) => get().productIds.includes(productId),
      remove: (productId) =>
        set((s) => ({ productIds: s.productIds.filter(id => id !== productId) })),
      clear: () => set({ productIds: [] }),
    }),
    { name: 'ask-wishlist' }
  )
)

interface CompareState {
  productIds: string[]
  toggle: (productId: string) => void
  has: (productId: string) => boolean
  remove: (productId: string) => void
  clear: () => void
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((s) => {
          if (s.productIds.includes(productId)) {
            return { productIds: s.productIds.filter(id => id !== productId) }
          }
          if (s.productIds.length >= 4) return s // max 4 for compare
          return { productIds: [...s.productIds, productId] }
        }),
      has: (productId) => get().productIds.includes(productId),
      remove: (productId) =>
        set((s) => ({ productIds: s.productIds.filter(id => id !== productId) })),
      clear: () => set({ productIds: [] }),
    }),
    { name: 'ask-compare' }
  )
)
