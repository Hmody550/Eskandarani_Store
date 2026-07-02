/**
 * FeaturesStrip — value propositions, between hero and categories.
 */
'use client'

import { Truck, Shield, RefreshCw, Headphones } from 'lucide-react'
import { motion } from 'framer-motion'

const FEATURES = [
  { icon: Truck, title: 'شحن سريع', desc: 'توصيل خلال 24-48 ساعة' },
  { icon: Shield, title: 'دفع آمن', desc: 'حماية 100% لمعاملاتك' },
  { icon: RefreshCw, title: 'استرجاع سهل', desc: 'خلال 14 يوم بدون أسئلة' },
  { icon: Headphones, title: 'دعم 24/7', desc: 'فريق دعم متخصص' },
]

export function FeaturesStrip() {
  return (
    <section className="container-x -mt-6 lg:-mt-10 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-4 flex items-center gap-3 shadow-soft"
          >
            <div className="size-10 lg:size-12 rounded-xl bg-primary/10 grid place-items-center shrink-0">
              <f.icon className="size-5 lg:size-6 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">{f.title}</div>
              <div className="text-xs text-muted-foreground">{f.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
