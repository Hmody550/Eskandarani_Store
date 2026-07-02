/**
 * ProductsPage — listing with filters, sort, infinite scroll via useInfiniteQuery.
 */
'use client'

import { useUIStore } from '@/shared/stores/ui.store'
import { useHomeData } from '@/shared/hooks/queries'
import { ProductCard, ProductCardSkeleton } from '@/shared/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Filter, X, SlidersHorizontal, Search, PackageSearch } from 'lucide-react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { formatPrice } from '@/lib/format'

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'best-selling', label: 'الأكثر مبيعاً' },
  { value: 'price-asc', label: 'السعر: من الأقل للأعلى' },
  { value: 'price-desc', label: 'السعر: من الأعلى للأقل' },
  { value: 'rating', label: 'الأعلى تقييماً' },
]

const PAGE_SIZE = 24

export function ProductsPage() {
  const { productFilters, setProductFilters, resetFilters } = useUIStore()
  const { data: home } = useHomeData()
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 80000])
  const [searchInput, setSearchInput] = useState('')
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Debounced search (timers are external systems, allowed)
  useEffect(() => {
    const t = setTimeout(() => {
      const current = productFilters.search ?? ''
      if (searchInput !== current) {
        setProductFilters({ search: searchInput || undefined })
      }
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput, setProductFilters, productFilters.search])

  // Build query key — when filters change, query auto-resets
  const queryKey = useMemo(() => ['products-infinite', productFilters], [productFilters])

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      Object.entries({ ...productFilters, cursor: pageParam, limit: PAGE_SIZE }).forEach(([k, v]) => {
        if (v === undefined || v === null) return
        if (Array.isArray(v)) {
          if (v.length) params.set(k, v.join(','))
        } else {
          params.set(k, String(v))
        }
      })
      const res = await fetch(`/api/products/list?${params}`)
      if (!res.ok) throw new Error('فشل')
      return res.json() as Promise<{ items: any[]; nextCursor: string | null; total: number }>
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 60 * 1000,
  })

  const allItems = query.data?.pages.flatMap(p => p.items) ?? []
  const total = query.data?.pages[0]?.total ?? 0
  const hasNextPage = query.hasNextPage

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage()
      }
    }, { rootMargin: '800px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage])

  const toggleArrayFilter = (key: 'categoryIds' | 'brandIds', id: string) => {
    const current = (productFilters[key] ?? []) as string[]
    if (current.includes(id)) {
      setProductFilters({ [key]: current.filter(x => x !== id) } as any)
    } else {
      setProductFilters({ [key]: [...current, id] } as any)
    }
  }

  const activeFiltersCount =
    (productFilters.brandIds?.length ?? 0) +
    (productFilters.categoryIds?.length ?? 0) +
    (productFilters.isFeatured ? 1 : 0) +
    (productFilters.isBestSeller ? 1 : 0) +
    (productFilters.isNewArrival ? 1 : 0) +
    (productFilters.isOnSale ? 1 : 0) +
    (productFilters.search ? 1 : 0)

  return (
    <div className="container-x section-y-sm">
      <div className="mb-4 lg:mb-6">
        <nav className="text-xs text-muted-foreground mb-2">
          <button onClick={() => useUIStore.getState().setView('home')} className="hover:text-primary">الرئيسية</button>
          <span className="mx-1">/</span>
          <span className="text-foreground">المنتجات</span>
        </nav>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-extrabold">
              {productFilters.isOnSale ? 'العروض' :
               productFilters.isBestSeller ? 'الأكثر مبيعاً' :
               productFilters.isNewArrival ? 'وصل حديثاً' :
               productFilters.isFeatured ? 'منتجات مميزة' :
               productFilters.categoryIds?.length ? 'منتجات الفئة' : 'كل المنتجات'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total > 0 ? `${total} منتج متوفر` : 'جاري التحميل...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="h-10 pr-9 w-48 lg:w-64"
              />
            </div>
            <Select
              value={productFilters.sort ?? 'newest'}
              onValueChange={(v) => setProductFilters({ sort: v })}
            >
              <SelectTrigger className="h-10 w-40 lg:w-52">
                <SlidersHorizontal className="size-4 ml-2" />
                <SelectValue placeholder="ترتيب" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden h-10 w-10 relative">
                  <Filter className="size-4" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -left-1 size-4 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overflow-y-auto">
                <FiltersPanel
                  home={home}
                  productFilters={productFilters}
                  toggleArrayFilter={toggleArrayFilter}
                  setProductFilters={setProductFilters}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  activeFiltersCount={activeFiltersCount}
                  resetFilters={resetFilters}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <FiltersPanel
              home={home}
              productFilters={productFilters}
              toggleArrayFilter={toggleArrayFilter}
              setProductFilters={setProductFilters}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              activeFiltersCount={activeFiltersCount}
              resetFilters={resetFilters}
            />
          </div>
        </aside>

        <div>
          {query.isLoading && allItems.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : allItems.length === 0 ? (
            <div className="text-center py-20">
              <PackageSearch className="size-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">لا توجد منتجات مطابقة</h3>
              <p className="text-sm text-muted-foreground mb-4">جرّب تعديل الفلاتر أو البحث عن شيء آخر</p>
              <Button onClick={resetFilters} variant="outline" className="gap-2">
                <X className="size-4" /> مسح الفلاتر
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                {allItems.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-12 flex items-center justify-center mt-4">
                {query.isFetchingNextPage && (
                  <span className="text-sm text-muted-foreground">جاري تحميل المزيد...</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FiltersPanel({
  home,
  productFilters,
  toggleArrayFilter,
  setProductFilters,
  priceRange,
  setPriceRange,
  activeFiltersCount,
  resetFilters,
}: any) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter className="size-4" /> الفلاتر
        </h3>
        {activeFiltersCount > 0 && (
          <button onClick={resetFilters} className="text-xs text-destructive hover:underline">
            مسح الكل ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">عرض</div>
        {[
          { key: 'isOnSale', label: 'العروض' },
          { key: 'isBestSeller', label: 'الأكثر مبيعاً' },
          { key: 'isNewArrival', label: 'وصل حديثاً' },
          { key: 'isFeatured', label: 'مميز' },
        ].map(f => (
          <div key={f.key} className="flex items-center gap-2">
            <Checkbox
              id={f.key}
              checked={!!productFilters[f.key]}
              onCheckedChange={(c) => setProductFilters({ [f.key]: c || undefined })}
            />
            <Label htmlFor={f.key} className="text-sm cursor-pointer">{f.label}</Label>
          </div>
        ))}
      </div>

      {home?.categories && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">الفئات</div>
          {home.categories.map((cat: any) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={productFilters.categoryIds?.includes(cat.id) ?? false}
                onCheckedChange={() => toggleArrayFilter('categoryIds', cat.id)}
              />
              <Label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer flex-1">
                {cat.name}
                <span className="text-xs text-muted-foreground mr-1">({cat.productCount})</span>
              </Label>
            </div>
          ))}
        </div>
      )}

      {home?.brands && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">الماركات</div>
          {home.brands.map((brand: any) => (
            <div key={brand.id} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={productFilters.brandIds?.includes(brand.id) ?? false}
                onCheckedChange={() => toggleArrayFilter('brandIds', brand.id)}
              />
              <Label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer flex-1">
                {brand.name}
                <span className="text-xs text-muted-foreground mr-1">({brand.productCount})</span>
              </Label>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="text-xs font-semibold text-muted-foreground">نطاق السعر</div>
        <Slider
          value={priceRange}
          min={0}
          max={80000}
          step={500}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          className="py-2"
        />
        <div className="flex justify-between text-xs">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setProductFilters({ minPrice: priceRange[0], maxPrice: priceRange[1] })}
        >
          تطبيق السعر
        </Button>
      </div>
    </div>
  )
}
