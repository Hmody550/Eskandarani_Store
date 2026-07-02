/**
 * ContactPage — contact form + info.
 */
'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('تم إرسال رسالتك!', { description: 'سنرد عليك خلال 24 ساعة.' })
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="container-x section-y">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold mb-3">تواصل معنا</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">نحن هنا لمساعدتك. تواصل معنا في أي وقت وسنرد عليك بأسرع ما يمكن.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="p-6">
          <h2 className="font-bold mb-4">أرسل لنا رسالة</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="message">الرسالة</Label>
              <textarea
                id="message"
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                required
                rows={5}
                className="w-full mt-1 p-3 rounded-xl border border-input bg-background text-sm resize-none"
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              <Send className="size-4" /> إرسال
            </Button>
          </form>
        </Card>

        {/* Info */}
        <div className="space-y-4">
          {[
            { icon: MapPin, title: 'العنوان', value: 'الإسكندرية، جمهورية مصر العربية' },
            { icon: Phone, title: 'الهاتف', value: '+20 100 123 4567', dir: 'ltr' },
            { icon: Mail, title: 'البريد الإلكتروني', value: 'support@askandarani.phone' },
            { icon: Clock, title: 'ساعات العمل', value: 'السبت - الخميس، 9 صباحاً - 11 مساءً' },
          ].map((c, i) => (
            <Card key={i} className="p-5 flex items-start gap-4">
              <div className="size-10 rounded-xl bg-primary/10 grid place-items-center shrink-0">
                <c.icon className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold mb-0.5">{c.title}</div>
                <div className="text-sm text-muted-foreground" dir={c.dir as any}>{c.value}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
