/**
 * ProductCarousel — reusable horizontal scroll for product sections.
 */
'use client'

import { useRef } from 'react'
import { useUIStore } from '@/shared/stores/ui.store'
import { ProductCard, ProductCardSkeleton } from '@/shared/components/product-card'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react'
import type { ProductCardData } from '@/types'

export function ProductCarousel({
  title,
  subtitle,
  products,
  isLoading,
  viewAllAction,
  accent = false,
}: {
  title: string
  subtitle?: string
  products: ProductCardData[]
  isLoading?: boolean
  viewAllAction?: () => void
  accent?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.7
    // In RTL, "right" visually is "back", and "left" is "forward"
    scrollRef.current.scrollBy({ left: dir === 'right' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className={`container-x section-y-sm ${accent ? 'bg-gradient-to-l from-accent/40 to-transparent rounded-3xl py-10' : ''}`}>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-display text-xl lg:text-2xl font-extrabold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {viewAllAction && (
            <Button variant="ghost" size="sm" onClick={viewAllAction} className="gap-1 hidden sm:flex">
              عرض الكل <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="size-9" onClick={() => scroll('right')} aria-label="السابق">
              <ChevronRight className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-9" onClick={() => scroll('left')} aria-label="التالي">
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 lg:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-[160px] sm:w-[200px] lg:w-[240px]">
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((p, i) => (
              <div key={p.id} className="snap-start shrink-0 w-[160px] sm:w-[200px] lg:w-[240px]">
                <ProductCard product={p} index={i} />
              </div>
            ))}
      </div>
    </section>
  )
}
