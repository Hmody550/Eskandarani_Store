/**
 * HeroSection — premium dark+gold hero with logo and luxury feel.
 */
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/shared/stores/ui.store'
import { ArrowLeft, Sparkles, Shield, Truck, Zap, Star } from 'lucide-react'

export function HeroSection() {
  const { setView, resetFilters } = useUIStore()

  return (
    <section className="relative overflow-hidden gradient-premium">
      {/* Decorative gold orbs */}
      <div className="absolute -top-24 -left-24 size-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-gold/15 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full border border-gold/10 pointer-events-none" />

      <div className="container-x relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-20">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center lg:text-right"
        >
          <Badge className="mb-4 gap-1.5 px-3 py-1.5 gradient-gold text-gold-foreground border-gold" variant="secondary">
            <Sparkles className="size-3.5" />
            <span>أحدث إصدارات 2026 · Premium Selection</span>
          </Badge>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-4">
            اكتشف عالم
            <span className="gradient-royal-text"> الهواتف الذكية </span>
            الفاخرة
          </h1>

          <p className="text-base lg:text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            آلاف المنتجات الأصلية من أشهر الماركات العالمية. شحن سريع، ضمان وكيل، ودفع آمن — تجربة تسوق فاخرة بمعايير عالمية.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
            <Button
              size="lg"
              className="h-12 px-6 gap-2 shadow-gold gradient-gold text-gold-foreground hover:shadow-glow text-base border border-gold/30"
              onClick={() => { resetFilters(); setView('products') }}
            >
              تسوّق الآن
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 gap-2 text-base border-gold/30 hover:bg-accent"
              onClick={() => { resetFilters(); useUIStore.getState().setProductFilters({ isOnSale: true }); setView('products') }}
            >
              <Zap className="size-5 text-gold" />
              عروض اليوم
            </Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
            {[
              { icon: Truck, label: 'شحن سريع', sub: '24-48 ساعة' },
              { icon: Shield, label: 'ضمان وكيل', sub: 'حتى سنة' },
              { icon: Zap, label: 'دفع آمن', sub: '100%' },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-gold rounded-xl p-3 text-center"
              >
                <t.icon className="size-5 mx-auto mb-1 text-gold" />
                <div className="text-xs font-semibold">{t.label}</div>
                <div className="text-[10px] text-muted-foreground">{t.sub}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Visual — Logo showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative hidden lg:block"
        >
          <div className="relative aspect-square max-w-lg mx-auto">
            {/* Glowing background circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gold/20 via-gold/5 to-transparent blur-2xl" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-gold/10"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute size-1 rounded-full bg-gold"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 30}deg) translateY(-220px)`,
                  }}
                />
              ))}
            </motion.div>

            {/* Logo */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative aspect-square rounded-full overflow-hidden shadow-elevated ring-4 ring-gold/30"
            >
              {/* Static version param for cache busting */}
              <img
                src="/askandarani-brand-logo.svg"
                alt="أسكندراني فون — Premium"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Floating price card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-4 -left-4 glass-gold rounded-2xl p-4 shadow-elevated"
            >
              <div className="text-xs text-muted-foreground">يبدأ من</div>
              <div className="text-2xl font-extrabold gradient-text">6,499 ج.م</div>
              <div className="text-xs text-success font-medium">خصم حتى 30%</div>
            </motion.div>

            {/* Floating rating */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute -top-4 -right-4 glass-gold rounded-2xl p-3 shadow-elevated flex items-center gap-2"
            >
              <div className="size-10 rounded-full gradient-gold grid place-items-center">
                <Star className="size-5 text-gold-foreground fill-current" />
              </div>
              <div>
                <div className="text-xs font-semibold">تقييم العملاء</div>
                <div className="text-[10px] text-muted-foreground">+12,000 عميل سعيد</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
