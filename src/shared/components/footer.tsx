/**
 * Footer — comprehensive, multi-column, RTL, newsletter.
 */
'use client'

import { useUIStore } from '@/shared/stores/ui.store'
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { toast } from 'sonner'

export function Footer() {
  const { setView, resetFilters } = useUIStore()
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success('تم الاشتراك بنجاح!', { description: 'سيصلك كل جديد وعروضنا الحصرية على بريدك.' })
    setEmail('')
  }

  return (
    <footer className="mt-auto bg-card border-t border-border mt-12">
      {/* Newsletter */}
      <div className="container-x py-10 lg:py-14">
        <div className="rounded-3xl gradient-premium p-6 lg:p-10 text-center relative overflow-hidden border-gold">
          <div className="absolute inset-0 bg-dots-pattern opacity-[0.05] pointer-events-none" />
          <div className="relative">
            <h3 className="font-display text-2xl lg:text-3xl font-extrabold mb-2 gradient-text">اشترك في نشرتنا البريدية</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              كن أول من يعرف عن أحدث المنتجات والعروض الحصرية. خصم 10% على أول طلب عند الاشتراك.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="بريدك الإلكتروني"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 rounded-full bg-background"
              />
              <Button type="submit" size="lg" className="h-12 rounded-full px-6 gap-2 shrink-0 gradient-gold text-gold-foreground shadow-gold">
                <Send className="size-4" />
                اشترك الآن
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-x pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative size-12 rounded-full overflow-hidden shadow-glow ring-1 ring-gold/30">
                <img src="/askandarani-brand-logo.svg" alt="أسكندراني فون" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-display font-extrabold gradient-text">أسكندراني فون</div>
                <div className="text-[10px] text-muted-foreground tracking-widest">PREMIUM · EGYPT</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              متجرك الموثوق لشراء أحدث الهواتف الذكية والإكسسوارات الأصلية بأفضل الأسعار في مصر.
            </p>
            <div className="flex gap-2">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="size-9 rounded-full bg-secondary grid place-items-center hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="social">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4">تسوّق</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => { resetFilters(); setView('products') }} className="hover:text-primary">كل المنتجات</button></li>
              <li><button onClick={() => { resetFilters(); useUIStore.getState().setProductFilters({ isOnSale: true }); setView('products') }} className="hover:text-primary">العروض</button></li>
              <li><button onClick={() => { resetFilters(); useUIStore.getState().setProductFilters({ isNewArrival: true }); setView('products') }} className="hover:text-primary">وصل حديثاً</button></li>
              <li><button onClick={() => { resetFilters(); useUIStore.getState().setProductFilters({ isBestSeller: true }); setView('products') }} className="hover:text-primary">الأكثر مبيعاً</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => setView('order-tracking')} className="hover:text-primary">تتبع الطلب</button></li>
              <li><button onClick={() => setView('account')} className="hover:text-primary">حسابي</button></li>
              <li><a href="#" className="hover:text-primary">سياسة الاسترجاع</a></li>
              <li><a href="#" className="hover:text-primary">الأسئلة الشائعة</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">عن المتجر</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => setView('about')} className="hover:text-primary">من نحن</button></li>
              <li><a href="#" className="hover:text-primary">سياسة الخصوصية</a></li>
              <li><a href="#" className="hover:text-primary">الشروط والأحكام</a></li>
              <li><button onClick={() => setView('contact')} className="hover:text-primary">تواصل معنا</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="size-4 shrink-0 mt-0.5 text-primary" />
                <span>الإسكندرية، مصر</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-primary" />
                <span dir="ltr">+20 100 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-primary" />
                <span>support@askandarani.phone</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} أسكندراني فون. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {['VISA', 'Master', 'Meeza', 'Fawry', 'Vodafone Cash'].map(p => (
              <span key={p} className="text-[10px] font-bold px-2 py-1 rounded-md bg-secondary text-muted-foreground border border-border">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
