/**
 * BrandsSection — premium brand grid driven by DB.
 */
'use client'

import { motion } from 'framer-motion'
import { useHomeData } from '@/shared/hooks/queries'
import { useUIStore } from '@/shared/stores/ui.store'
import { Skeleton } from '@/components/ui/skeleton'

export function BrandsSection() {
  const { data, isLoading } = useHomeData()
  const { setView, resetFilters, setProductFilters } = useUIStore()

  const handleClick = (brandId: string) => {
    resetFilters()
    setProductFilters({ brandIds: [brandId] })
    setView('products')
  }

  // Only show brands that have products
  const brands = data?.brands.filter(b => b.productCount > 0) ?? []

  return (
    <section className="container-x section-y-sm">
      <div className="text-center mb-6 lg:mb-8">
        <h2 className="font-display text-2xl lg:text-3xl font-extrabold gradient-text">ماركاتنا الفاخرة</h2>
        <p className="text-sm text-muted-foreground mt-1">نوفر لك أحدث المنتجات من أشهر العلامات التجارية</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/2] rounded-2xl" />)}
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">لا توجد ماركات نشطة بعد.</div>
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {brands.map((brand, i) => (
            <motion.button
              key={brand.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleClick(brand.id)}
              className="group aspect-[3/2] rounded-2xl bg-card border border-border grid place-items-center hover:shadow-glow hover:border-gold/40 transition-all overflow-hidden"
            >
              <div className="text-center p-2">
                {brand.logoUrl ? (
                  <div className="size-10 mx-auto rounded-lg overflow-hidden bg-muted mb-1 ring-1 ring-gold/20 group-hover:ring-gold/40 transition-all">
                    <img src={brand.logoUrl} alt={brand.name} className="size-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  <div className="font-bold text-base lg:text-lg group-hover:text-gold transition-colors gradient-text">{brand.name}</div>
                )}
                {brand.logoUrl && <div className="text-[10px] text-muted-foreground group-hover:text-gold transition-colors">{brand.name}</div>}
                <div className="text-[10px] text-muted-foreground mt-0.5">{brand.productCount} منتج</div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </section>
  )
}
