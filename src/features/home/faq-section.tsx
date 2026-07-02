/**
 * FAQSection — accordion FAQ.
 */
'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { motion } from 'framer-motion'

const FAQS = [
  { q: 'هل المنتجات أصلية؟', a: 'نعم، جميع منتجاتنا أصلية 100% ومستوردة من مصادر معتمدة. نوفر ضمان وكيل رسمي على معظم المنتجات، مع إمكانية استرجاع خلال 14 يوم.' },
  { q: 'كم تستغرق مدة التوصيل؟', a: 'التوصيل داخل القاهرة الكبرى والإسكندرية من 1-2 يوم عمل. باقي المحافظات من 2-4 أيام عمل. نوفر خدمة التوصيل السريع خلال 24 ساعة برسوم إضافية.' },
  { q: 'ما هي طرق الدفع المتاحة؟', a: 'نوفر الدفع عند الاستلام، البطاقات الائتمانية (Visa, Mastercard)، فوري، محفظة فودافون، إنستاباي. جميع المعاملات مشفرة وآمنة 100%.' },
  { q: 'هل يمكنني استرجاع المنتج؟', a: 'نعم، يمكنك استرجاع المنتج خلال 14 يوماً من الاستلام بشرط أن يكون بحالته الأصلية مع التغليف. المبلغ يُسترَد خلال 5-7 أيام عمل.' },
  { q: 'هل يوجد ضمان على المنتجات؟', a: 'نعم، جميع الهواتف الذكية تأتي بضمان وكيل لمدة سنة على الأقل. الإكسسوارات تختلف فترات ضمانها حسب المنتج، والمعلومات موضحة في صفحة كل منتج.' },
  { q: 'كيف أتابع طلبي؟', a: 'بعد إتمام الطلب، ستصلك رسالة بريد إلكتروني تحتوي على رقم الطلب. يمكنك تتبع الطلب من صفحة "تتبع الطلب" باستخدام رقم الطلب والبريد الإلكتروني.' },
]

export function FAQSection() {
  return (
    <section className="container-x section-y">
      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-1"
        >
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold mb-3">الأسئلة الشائعة</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            إجابات على أكثر الأسئلة شيوعاً. لم تجد إجابتك؟ تواصل معنا في أي وقت.
          </p>
          <div className="p-4 rounded-2xl bg-accent/40">
            <div className="text-sm font-semibold mb-1">تحتاج مساعدة؟</div>
            <div className="text-xs text-muted-foreground">فريق الدعم متاح 24/7</div>
            <a href="tel:+201001234567" className="text-sm text-primary font-medium mt-2 block" dir="ltr">+20 100 123 4567</a>
          </div>
        </motion.div>

        <div className="lg:col-span-2">
          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border rounded-2xl px-5 bg-card overflow-hidden data-[state=open]:shadow-soft"
              >
                <AccordionTrigger className="text-right hover:no-underline py-4 text-sm lg:text-base font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
