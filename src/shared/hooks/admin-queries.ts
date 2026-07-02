/**
 * Admin React Query hooks — full CRUD for products, brands, categories, coupons.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================
// Brands
// ============================================================
export function useAdminBrands(search?: string) {
  return useQuery({
    queryKey: ['admin', 'brands', search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/brands?${params}`)
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{ brands: any[] }>
    },
    staleTime: 30 * 1000,
  })
}

export function useCreateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: any) => {
      const res = await fetch('/api/admin/brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'brands'] }); qc.invalidateQueries({ queryKey: ['home'] }); toast.success('تم إنشاء الماركة') },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useUpdateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const res = await fetch(`/api/admin/brands/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'brands'] }); qc.invalidateQueries({ queryKey: ['home'] }); toast.success('تم تحديث الماركة') },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useDeleteBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الحذف')
      return res.json()
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'brands'] }); qc.invalidateQueries({ queryKey: ['home'] }); toast.success('تم حذف الماركة') },
    onError: (e: any) => toast.error(e.message),
  })
}

// ============================================================
// Categories
// ============================================================
export function useAdminCategories(search?: string) {
  return useQuery({
    queryKey: ['admin', 'categories', search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/categories?${params}`)
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{ categories: any[] }>
    },
    staleTime: 30 * 1000,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: any) => {
      const res = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); qc.invalidateQueries({ queryKey: ['home'] }); toast.success('تم إنشاء الفئة') },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); qc.invalidateQueries({ queryKey: ['home'] }); toast.success('تم تحديث الفئة') },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الحذف')
      return res.json()
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); qc.invalidateQueries({ queryKey: ['home'] }); toast.success('تم حذف الفئة') },
    onError: (e: any) => toast.error(e.message),
  })
}

// ============================================================
// Products
// ============================================================
export function useAdminProducts(filters?: { search?: string; brandId?: string; categoryId?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.search) params.set('search', filters.search)
      if (filters?.brandId) params.set('brandId', filters.brandId)
      if (filters?.categoryId) params.set('categoryId', filters.categoryId)
      if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive))
      const res = await fetch(`/api/admin/products?${params}`)
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{ products: any[] }>
    },
    staleTime: 30 * 1000,
  })
}

export function useAdminProduct(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/products/${id}`)
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{ product: any }>
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: any) => {
      const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); qc.invalidateQueries({ queryKey: ['home'] }); toast.success('تم إنشاء المنتج بنجاح') },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); qc.invalidateQueries({ queryKey: ['home'] }); toast.success('تم تحديث المنتج') },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الحذف')
      return res.json()
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); qc.invalidateQueries({ queryKey: ['home'] }); toast.success('تم حذف المنتج') },
    onError: (e: any) => toast.error(e.message),
  })
}

// ============================================================
// Coupons
// ============================================================
export function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const res = await fetch('/api/admin/coupons')
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{ coupons: any[] }>
    },
    staleTime: 30 * 1000,
  })
}

export function useCreateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: any) => {
      const res = await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }); toast.success('تم إنشاء الكوبون') },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useUpdateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }); toast.success('تم تحديث الكوبون') },
    onError: (e: any) => toast.error(e.message),
  })
}

export function useDeleteCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الحذف')
      return res.json()
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }); toast.success('تم حذف الكوبون') },
    onError: (e: any) => toast.error(e.message),
  })
}

// ============================================================
// Image upload
// ============================================================
export function useUploadImage() {
  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: 'products' | 'brands' | 'categories' }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data as { url: string; filename: string; size: number }
    },
    onError: (e: any) => toast.error(e.message ?? 'فشل رفع الصورة'),
  })
}
