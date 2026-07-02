/**
 * TestimonialsSection — customer reviews carousel.
 */
'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const TESTIMONIALS = [
  { name: 'أحمد محمود', city: 'القاهرة', rating: 5, text: 'اشتريت iPhone 15 Pro Max من الأسكندراني. وصل الطلب خلال 24 ساعة، والجهاز أصلي مع ضمان وكيل. خدمة الدعم أكدت تفاصيل الشحن بسرعة وشعرت بالثقة طوال الوقت.', initials: 'أم' },
  { name: 'سارة عبد الله', city: 'الإسكندرية', rating: 5, text: 'طلبت AirPods Pro وتم التواصل معي عبر رقم الدعم +201001616895 لتأكيد الطلب. تجربة التواصل كانت احترافية، والشحن كان سريع والمنتج أصلي بالكامل.', initials: 'سع' },
  { name: 'كريم حسن', city: 'الجيزة', rating: 5, text: 'الموقع قدم لي عرضاً واضحاً على Samsung Galaxy S24 مع تسليم مضمن وضمان رسمي. الطلب كان سلساً، والدعم الفني كان موجود بشكل فوري في أي استفسار.', initials: 'كح' },
  { name: 'منى السيد', city: 'المنصورة', rating: 5, text: 'اخترت الأسكندراني لشراء شاحن سريع وأكسسوارات أصلية. الجودة كانت ممتازة والتوصيل سريع جداً. خدمة العملاء كانت داعمة للغاية وساعدتني في اختيار المنتج الصحيح.', initials: 'مس' },
]

export function TestimonialsSection() {
  return (
    <section className="container-x section-y">
      <div className="text-center mb-8 lg:mb-10">
        <h2 className="font-display text-2xl lg:text-3xl font-extrabold">تجارب حقيقية من عملاء الأسكندراني</h2>
        <p className="text-sm text-muted-foreground mt-1">آراء حديثة تعتمد على شراء فعلي وخدمة دعم مباشر عبر +201001616895</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="p-5 h-full relative overflow-hidden">
              <Quote className="absolute -top-2 -left-2 size-16 text-primary/10 rotate-180" />
              <div className="flex gap-1 mb-3 relative">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`size-4 ${j < t.rating ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-4 relative line-clamp-4">{t.text}</p>
              <div className="flex items-center gap-3 relative">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.city}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { value: '+50K', label: 'عميل سعيد' },
          { value: '+10K', label: 'منتج أصلي' },
          { value: '4.9★', label: 'تقييم المتجر' },
          { value: '24/7', label: 'دعم فني' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-4 rounded-2xl bg-accent/40"
          >
            <div className="font-display text-3xl lg:text-4xl font-extrabold gradient-text">{s.value}</div>
            <div className="text-xs lg:text-sm text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm font-semibold text-primary">للدعم الفني المباشر: +201001616895</p>
      </div>
    </section>
  )
}
