/**
 * AboutPage — company info.
 */
'use client'

import { Card } from '@/components/ui/card'
import { Smartphone, Heart, Target, Users, Award, Truck } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="container-x section-y">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold mb-3">من نحن</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          أسكندراني فون هو متجرك الإلكتروني الموثوق لشراء أحدث الهواتف الذكية والإكسسوارات الأصلية. نهدف إلى تقديم تجربة تسوق استثنائية بأسعار منافسة وخدمة عملاء متميزة.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Target, title: 'رسالتنا', desc: 'توفير منتجات تقنية أصلية بأفضل الأسعار وأعلى جودة خدمة لكل عملائنا في مصر.' },
          { icon: Heart, title: 'قيمنا', desc: 'الثقة، الشفافية، والالتزام برضا العميل. كل قرار نتخذه يضع العميل في المقدمة.' },
          { icon: Award, title: 'جودتنا', desc: 'منتجات أصلية 100% مع ضمان وكيل رسمي. لا نساوم على الجودة مهما كان.' },
        ].map((c, i) => (
          <Card key={i} className="p-6">
            <div className="size-12 rounded-xl bg-primary/10 grid place-items-center mb-3">
              <c.icon className="size-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">{c.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: '+50K', label: 'عميل سعيد', icon: Users },
          { value: '+10K', label: 'منتج أصلي', icon: Smartphone },
          { value: '24/7', label: 'دعم فني', icon: Award },
          { value: '1-2', label: 'يوم توصيل', icon: Truck },
        ].map((s, i) => (
          <Card key={i} className="p-5 text-center">
            <s.icon className="size-8 mx-auto text-primary mb-2" />
            <div className="font-display text-2xl font-extrabold gradient-text">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
