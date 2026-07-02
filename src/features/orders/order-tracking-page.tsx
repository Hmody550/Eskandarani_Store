/**
 * OrderTrackingPage — lookup order by number + email, view timeline, invoice, reorder.
 */
'use client'

import { useState } from 'react'
import { useOrder } from '@/shared/hooks/queries'
import { useUIStore } from '@/shared/stores/ui.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, Package, CheckCircle2, Truck, Home, Clock, RotateCcw, Printer, MapPin, CreditCard, PackageCheck } from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/format'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any; step: number }> = {
  PENDING: { label: 'بانتظار التأكيد', color: 'bg-warning text-warning-foreground', icon: Clock, step: 0 },
  CONFIRMED: { label: 'تم التأكيد', color: 'bg-info text-info-foreground', icon: CheckCircle2, step: 1 },
  PROCESSING: { label: 'قيد التجهيز', color: 'bg-info text-info-foreground', icon: Package, step: 2 },
  SHIPPED: { label: 'تم الشحن', color: 'bg-info text-info-foreground', icon: Truck, step: 3 },
  DELIVERED: { label: 'تم التوصيل', color: 'bg-success text-success-foreground', icon: Home, step: 4 },
  CANCELLED: { label: 'ملغي', color: 'bg-destructive text-destructive-foreground', icon: Package, step: -1 },
  REFUNDED: { label: 'مسترجع', color: 'bg-muted text-muted-foreground', icon: RotateCcw, step: -1 },
  ON_HOLD: { label: 'معلق', color: 'bg-warning text-warning-foreground', icon: Clock, step: 0 },
}

const TIMELINE_STEPS = [
  { key: 'PENDING', label: 'استلام الطلب', icon: Package },
  { key: 'CONFIRMED', label: 'تأكيد الطلب', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'تجهيز', icon: PackageCheck },
  { key: 'SHIPPED', label: 'الشحن', icon: Truck },
  { key: 'DELIVERED', label: 'التوصيل', icon: Home },
]

export function OrderTrackingPage() {
  const { orderNumber: initialOrderNumber } = useUIStore()
  const { setView } = useUIStore()
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber ?? '')
  const [email, setEmail] = useState('')
  const [searched, setSearched] = useState(!!initialOrderNumber)

  const { data, isLoading, error, refetch } = useOrder(searched ? orderNumber : null, email || undefined)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) return
    setSearched(true)
    refetch()
  }

  const handlePrint = () => window.print()

  return (
    <div className="container-x section-y-sm">
      <div className="mb-6">
        <h1 className="font-display text-2xl lg:text-3xl font-extrabold">تتبع طلبك</h1>
        <p className="text-sm text-muted-foreground mt-1">أدخل رقم الطلب والبريد الإلكتروني لعرض تفاصيل وحالة الطلب</p>
      </div>

      <Card className="p-5 mb-6 no-print">
        <form onSubmit={handleSearch} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
          <div>
            <Label htmlFor="orderNumber" className="text-sm">رقم الطلب</Label>
            <Input
              id="orderNumber"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="ASK-XXXXXX-XXXX"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" size="lg" className="w-full gap-2">
              <Search className="size-4" /> بحث
            </Button>
          </div>
        </form>
      </Card>

      {searched && isLoading && (
        <Card className="p-12 text-center">
          <div className="animate-pulse">جاري البحث...</div>
        </Card>
      )}

      {searched && error && (
        <Card className="p-8 text-center">
          <p className="text-destructive font-semibold mb-2">لم يتم العثور على الطلب</p>
          <p className="text-sm text-muted-foreground">تأكد من رقم الطلب والبريد الإلكتروني</p>
        </Card>
      )}

      {data?.order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Status header */}
          <Card className="p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <div>
                <div className="text-xs text-muted-foreground">رقم الطلب</div>
                <div className="font-display font-extrabold text-xl">{data.order.orderNumber}</div>
                <div className="text-xs text-muted-foreground mt-1">{formatDateTime(data.order.createdAt)}</div>
              </div>
              <div className="flex gap-2">
                <Badge className={STATUS_CONFIG[data.order.status as OrderStatus].color}>
                  {STATUS_CONFIG[data.order.status as OrderStatus].label}
                </Badge>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1 no-print">
                  <Printer className="size-4" /> فاتورة
                </Button>
              </div>
            </div>

            {/* Timeline */}
            {data.order.status !== 'CANCELLED' && data.order.status !== 'REFUNDED' ? (
              <div className="relative">
                <div className="flex justify-between">
                  {TIMELINE_STEPS.map((s, i) => {
                    const reached = data.order.timeline.some(t => t.status === s.key) || (data.order.status === 'DELIVERED' && i < 4)
                    const isCurrent = data.order.status === s.key
                    return (
                      <div key={s.key} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                        <div className={cn(
                          "size-10 lg:size-12 rounded-full grid place-items-center transition-all",
                          reached ? "bg-success text-success-foreground" :
                          isCurrent ? "bg-primary text-primary-foreground shadow-glow scale-110" :
                          "bg-muted text-muted-foreground"
                        )}>
                          <s.icon className="size-5" />
                        </div>
                        <div className={cn(
                          "text-[10px] lg:text-xs font-medium text-center",
                          (reached || isCurrent) && "text-foreground"
                        )}>
                          {s.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* Line */}
                <div className="absolute top-5 lg:top-6 right-0 left-0 h-0.5 bg-muted -z-0">
                  <motion.div
                    className="h-full bg-success"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(TIMELINE_STEPS.findIndex(s => s.key === data.order.status) / (TIMELINE_STEPS.length - 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-destructive/10 text-center">
                <Package className="size-10 mx-auto text-destructive mb-2" />
                <p className="font-semibold text-destructive">تم إلغاء هذا الطلب</p>
              </div>
            )}

            {/* Tracking number */}
            {data.order.trackingNumber && (
              <div className="mt-4 p-3 rounded-xl bg-accent/30 flex items-center gap-2">
                <Truck className="size-4 text-primary" />
                <span className="text-sm">رقم التتبع:</span>
                <span className="font-mono font-semibold">{data.order.trackingNumber}</span>
              </div>
            )}
          </Card>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            {/* Items */}
            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="font-bold mb-4">منتجات الطلب</h3>
                <div className="space-y-3">
                  {data.order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="size-16 rounded-xl overflow-hidden bg-muted shrink-0">
                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => item.slug && useUIStore.getState().setView('product-detail', { productSlug: item.slug! })}
                          className="text-sm font-semibold line-clamp-2 hover:text-primary text-right"
                        >
                          {item.name}
                        </button>
                        {item.variantName && <div className="text-xs text-muted-foreground">{item.variantName}</div>}
                        <div className="text-xs text-muted-foreground">الكمية: {item.quantity}</div>
                      </div>
                      <div className="font-bold text-primary">{formatPrice(item.total)}</div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 gap-2 no-print"
                  onClick={() => toast.success('تمت إضافة المنتجات للسلة')}
                >
                  <RotateCcw className="size-4" /> إعادة الطلب
                </Button>
              </Card>

              {/* Timeline history */}
              <Card className="p-5">
                <h3 className="font-bold mb-3">سجل الحالة</h3>
                <div className="space-y-3">
                  {data.order.timeline.map((t: any, i: number) => (
                    <div key={t.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn("size-3 rounded-full", i === 0 ? "bg-primary" : "bg-muted-foreground/30")} />
                        {i < data.order.timeline.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-3">
                        <div className="text-sm font-medium">{STATUS_CONFIG[t.status as OrderStatus].label}</div>
                        {t.note && <div className="text-xs text-muted-foreground">{t.note}</div>}
                        <div className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Address */}
              {data.order.address && (
                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-4 text-primary" />
                    <h3 className="font-bold">عنوان التوصيل</h3>
                  </div>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <div className="font-medium text-foreground">{data.order.address.firstName} {data.order.address.lastName}</div>
                    <div>{data.order.address.address1}</div>
                    <div>{data.order.address.city}, {data.order.address.country}</div>
                    <div dir="ltr" className="text-right">{data.order.address.phone}</div>
                    <div>{data.order.address.email}</div>
                  </div>
                </Card>
              )}

              {/* Payment */}
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="size-4 text-primary" />
                  <h3 className="font-bold">الدفع</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span>{formatPrice(data.order.subtotal)}</span>
                  </div>
                  {data.order.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>الخصم</span>
                      <span>- {formatPrice(data.order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الشحن</span>
                    <span>{data.order.shippingCost === 0 ? 'مجاني' : formatPrice(data.order.shippingCost)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span>الإجمالي</span>
                    <span className="text-primary">{formatPrice(data.order.total)}</span>
                  </div>
                  <Badge variant="outline" className={cn("mt-2", data.order.paymentStatus === 'PAID' ? "text-success border-success/30" : "text-warning border-warning/30")}>
                    {data.order.paymentStatus === 'PAID' ? 'مدفوع' : data.order.paymentStatus === 'PENDING' ? 'بانتظار الدفع' : data.order.paymentStatus}
                  </Badge>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

import { toast } from 'sonner'
