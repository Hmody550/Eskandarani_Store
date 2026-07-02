/**
 * CategoriesSection — premium circular category cards driven by DB.
 * Uses real category images from DB or icon fallback.
 */
'use client'

import { motion } from 'framer-motion'
import { useHomeData } from '@/shared/hooks/queries'
import { useUIStore } from '@/shared/stores/ui.store'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function CategoriesSection() {
  const { data, isLoading } = useHomeData()
  const { setView, resetFilters, setProductFilters } = useUIStore()

  const handleClick = (categoryId: string) => {
    resetFilters()
    setProductFilters({ categoryIds: [categoryId] })
    setView('products')
  }

  // Only show categories that have products
  const categories = data?.categories.filter(c => c.productCount > 0) ?? []

  return (
    <section className="container-x section-y">
      <div className="flex items-end justify-between mb-6 lg:mb-8">
        <div>
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold gradient-text">تسوّق حسب الفئة</h2>
          <p className="text-sm text-muted-foreground mt-1">اختر الفئة التي تناسب احتياجاتك</p>
        </div>
        {categories.length > 0 && (
          <button
            onClick={() => { resetFilters(); setView('products') }}
            className="text-sm text-primary hover:underline flex items-center gap-1 underline-gold"
          >
            عرض الكل <ArrowLeft className="size-4" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 lg:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="size-16 lg:size-20 rounded-2xl" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          لا توجد فئات نشطة بعد. أضف منتجات من لوحة الإدارة.
        </div>
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 lg:gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              onClick={() => handleClick(cat.id)}
              className="group flex flex-col items-center gap-2 p-2"
            >
              <div className="relative size-16 lg:size-20 rounded-2xl overflow-hidden border border-border group-hover:shadow-glow group-hover:border-gold/40 transition-all duration-300 bg-gradient-to-bl from-accent to-card">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-3xl">📦</div>
                )}
              </div>
              <div className="text-center">
                <div className="text-xs lg:text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{cat.name}</div>
                <div className="text-[10px] text-muted-foreground">{cat.productCount} منتج</div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </section>
  )
}
