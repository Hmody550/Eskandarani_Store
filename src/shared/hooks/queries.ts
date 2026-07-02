/**
 * React Query hooks — typed server state for catalog & cart.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { ProductCardData, ProductDetail, CategoryTreeNode, BrandData, CartLine, CartSummary } from '@/types'
import { useCartStore } from '@/shared/stores/cart.store'
import { useUIStore } from '@/shared/stores/ui.store'

// ============================================================
// Home / Catalog
// ============================================================

export function useHomeData() {
  return useQuery({
    queryKey: ['home'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/home')
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{
        categories: CategoryTreeNode[]
        brands: BrandData[]
        featured: ProductCardData[]
        bestSellers: ProductCardData[]
        newArrivals: ProductCardData[]
        onSale: ProductCardData[]
      }>
    },
    staleTime: 5 * 60 * 1000,
  })
}

export interface ProductFilters {
  search?: string
  brandIds?: string[]
  categoryIds?: string[]
  minPrice?: number
  maxPrice?: number
  isFeatured?: boolean
  isBestSeller?: boolean
  isNewArrival?: boolean
  isOnSale?: boolean
  sort?: string
  cursor?: string
  limit?: number
}

export function useProducts(filters: ProductFilters, enabled = true) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => {
        if (v === undefined || v === null) return
        if (Array.isArray(v)) {
          if (v.length) params.set(k, v.join(','))
        } else {
          params.set(k, String(v))
        }
      })
      const res = await fetch(`/api/products/list?${params}`)
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{
        items: ProductCardData[]
        nextCursor: string | null
        total: number
      }>
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useProduct(slug: string | null) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`)
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<ProductDetail>
    },
    enabled: !!slug,
    staleTime: 60 * 1000,
  })
}

// ============================================================
// Cart
// ============================================================

export function useCart() {
  // FIXED: don't call setState inside queryFn — causes infinite re-renders
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await fetch('/api/cart/lines')
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{ lines: CartLine[]; summary: CartSummary | null }>
    },
    staleTime: 30 * 1000,
  })
}

// Separate hook to sync cart store from query data
export function useCartSync() {
  const { data } = useCart()
  const { setLines, setSummary } = useCartStore()
  useEffect(() => {
    if (data) {
      setLines(data.lines)
      setSummary(data.summary)
    }
  }, [data, setLines, setSummary])
}

export function useAddToCart() {
  const qc = useQueryClient()
  const { optimisticAdd } = useCartStore()
  return useMutation({
    mutationFn: async (input: { productId: string; variantId?: string | null; quantity: number; line?: CartLine }) => {
      // Optimistic: if line provided, add it locally
      if (input.line) optimisticAdd(input.line)
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: input.productId, variantId: input.variantId, quantity: input.quantity }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'فشل' }))
        throw new Error(err.error || 'فشل')
      }
      return res.json() as Promise<{ lines: CartLine[]; summary: CartSummary }>
    },
    onSuccess: (data) => {
      useCartStore.getState().setLines(data.lines)
      useCartStore.getState().setSummary(data.summary)
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useUpdateCart() {
  const qc = useQueryClient()
  const { optimisticUpdateQty } = useCartStore()
  return useMutation({
    mutationFn: async (input: { lineId: string; quantity: number }) => {
      optimisticUpdateQty(input.lineId, input.quantity)
      const res = await fetch('/api/cart/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'فشل' }))
        throw new Error(err.error || 'فشل')
      }
      return res.json() as Promise<{ lines: CartLine[]; summary: CartSummary }>
    },
    onSuccess: (data) => {
      useCartStore.getState().setLines(data.lines)
      useCartStore.getState().setSummary(data.summary)
    },
    onError: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  })
}

export function useRemoveFromCart() {
  const qc = useQueryClient()
  const { optimisticRemove } = useCartStore()
  return useMutation({
    mutationFn: async (lineId: string) => {
      optimisticRemove(lineId)
      const res = await fetch(`/api/cart/remove?lineId=${lineId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{ lines: CartLine[]; summary: CartSummary }>
    },
    onSuccess: (data) => {
      useCartStore.getState().setLines(data.lines)
      useCartStore.getState().setSummary(data.summary)
    },
    onError: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  })
}

export function useApplyCoupon() {
  const qc = useQueryClient()
  const { setCoupon } = useCartStore()
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل')
      return data
    },
    onSuccess: (data) => {
      setCoupon(data.code, data.discount, data.freeShipping, data.message)
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: () => {
      setCoupon(null, 0, false, null)
    },
  })
}

export function useRemoveCoupon() {
  const qc = useQueryClient()
  const { setCoupon } = useCartStore()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/cart/coupon', { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل')
      return res.json()
    },
    onSuccess: () => {
      setCoupon(null, 0, false, null)
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

// ============================================================
// Checkout / Orders
// ============================================================

export function useShippingOptions(lines: CartLine[] | null, subtotal: number, enabled: boolean) {
  return useQuery({
    queryKey: ['shipping', subtotal, lines?.length],
    queryFn: async () => {
      const res = await fetch('/api/shipping/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, subtotal }),
      })
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{ options: Array<{ code: string; name: string; description: string | null; cost: number; estimatedDays: number; isFree: boolean; isRecommended: boolean }> }>
    },
    enabled,
  })
}

export function usePlaceOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: any) => {
      const res = await fetch('/api/checkout/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل')
      return data
    },
    onSuccess: () => {
      // CRITICAL: Clear cart completely after order success
      useCartStore.getState().reset()
      // Force refetch cart (will return empty)
      qc.invalidateQueries({ queryKey: ['cart'] })
      qc.removeQueries({ queryKey: ['cart'] })
      // Close cart drawer
      useUIStore.getState().closeCartDrawer()
    },
  })
}

export function useOrder(orderNumber: string | null, email?: string) {
  return useQuery({
    queryKey: ['order', orderNumber, email],
    queryFn: async () => {
      const params = new URLSearchParams({ orderNumber: orderNumber! })
      if (email) params.set('email', email)
      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{ order: any }>
    },
    enabled: !!orderNumber,
  })
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/metrics')
      if (!res.ok) throw new Error('فشل')
      return res.json()
    },
    staleTime: 60 * 1000,
  })
}

export function useAdminOrders(status?: string) {
  return useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin/orders?${params}`)
      if (!res.ok) throw new Error('فشل')
      return res.json()
    },
    staleTime: 30 * 1000,
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { orderId: string; status: string; note?: string }) => {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل')
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      qc.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
  })
}
