/**
 * OffersBanner — dynamic promotional banner pulling real on-sale products from DB.
 * No hardcoded data — everything comes from the API.
 */
'use client'

import { motion } from 'framer-motion'
import { useUIStore } from '@/shared/stores/ui.store'
import { useHomeData } from '@/shared/hooks/queries'
import { Button } from '@/components/ui/button'
import { Zap, Clock, ArrowLeft, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/format'

function useCountdown(targetHours: number) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })
  useEffect(() => {
    const target = Date.now() + targetHours * 3600 * 1000
    const t = setInterval(() => {
      const diff = target - Date.now()
      if (diff < 0) return
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }, 1000)
    return () => clearInterval(t)
  }, [targetHours])
  return time
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="size-12 lg:size-14 rounded-xl bg-background text-foreground grid place-items-center font-display font-extrabold text-xl lg:text-2xl tabular-nums shadow-glow border-gold">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[10px] mt-1 opacity-80">{label}</div>
    </div>
  )
}

export function OffersBanner() {
  const { setView, resetFilters, setProductFilters } = useUIStore()
  const { data: home } = useHomeData()
  const time = useCountdown(23)

  // Dynamic: pull real on-sale products from DB
  const saleProducts = (home?.onSale ?? []).slice(0, 4)

  // Calculate max discount dynamically
  const maxDiscount = saleProducts.length > 0
    ? Math.max(...saleProducts.map(p => p.discountPercent ?? 0))
    : 0

  // If no on-sale products, don't show the banner
  if (saleProducts.length === 0) return null

  return (
    <section className="container-x section-y-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl gradient-premium p-6 lg:p-10 border-gold"
      >
        <div className="absolute -top-12 -right-12 size-48 rounded-full bg-gold/20 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-gold/10 blur-2xl" />
        <div className="absolute inset-0 bg-dots-pattern opacity-[0.05] pointer-events-none" />

        <div className="relative grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-gold/20 px-3 py-1 rounded-full text-xs font-semibold mb-3 text-gold">
              <Zap className="size-3.5 fill-current" />
              عروض حصرية لفترة محدودة
            </div>
            <h3 className="font-display text-3xl lg:text-4xl font-extrabold mb-2 gradient-text">
              خصومات تصل إلى {maxDiscount}%
            </h3>
            <p className="text-base text-muted-foreground mb-4 max-w-md">
              على مجموعة مختارة من الهواتف الذكية والإكسسوارات. الكمية محدودة!
            </p>
            <div className="flex gap-3 items-center mb-5">
              <Clock className="size-5 text-gold" />
              <div className="flex gap-2" dir="ltr">
                <TimeBox value={time.h} label="ساعة" />
                <span className="text-2xl mt-3 text-gold">:</span>
                <TimeBox value={time.m} label="دقيقة" />
                <span className="text-2xl mt-3 text-gold">:</span>
                <TimeBox value={time.s} label="ثانية" />
              </div>
            </div>
            <Button
              size="lg"
              className="gap-2 gradient-gold text-gold-foreground shadow-gold hover:shadow-glow"
              onClick={() => { resetFilters(); setProductFilters({ isOnSale: true }); setView('products') }}
            >
              تسوّق العروض <ArrowLeft className="size-4" />
            </Button>
          </div>

          {/* Dynamic sale products from DB */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {saleProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-gold rounded-2xl p-3 cursor-pointer hover:shadow-soft transition-shadow"
                onClick={() => {
                  setView('product-detail', { productSlug: product.slug })
                }}
              >
                <div className="text-xs text-muted-foreground">عرض خاص</div>
                <div className="font-bold text-sm line-clamp-1">{product.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-success font-semibold">
                    خصم {product.discountPercent}%
                  </div>
                  <div className="text-xs text-muted-foreground line-through">
                    {product.comparePrice ? formatPrice(product.comparePrice) : ''}
                  </div>
                </div>
                <div className="text-sm font-bold text-primary mt-0.5">
                  {formatPrice(product.price)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
