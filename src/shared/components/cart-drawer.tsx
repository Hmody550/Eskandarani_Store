/**
 * CartDrawer — slide-out cart with optimistic UI, coupon, summary, checkout CTA.
 */
'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/shared/stores/ui.store'
import { useCartStore } from '@/shared/stores/cart.store'
import { useCart, useUpdateCart, useRemoveFromCart, useApplyCoupon, useRemoveCoupon } from '@/shared/hooks/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Minus, Plus, ShoppingBag, Tag, Trash2, ArrowLeft, Loader2, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function CartDrawer() {
  const { cartDrawerOpen, closeCartDrawer, setView } = useUIStore()
  const { lines, summary, couponCode, couponDiscount, couponFreeShipping, couponMessage } = useCartStore()
  const { isLoading } = useCart()
  const updateCart = useUpdateCart()
  const removeCart = useRemoveFromCart()
  const applyCoupon = useApplyCoupon()
  const removeCoupon = useRemoveCoupon()
  const [couponInput, setCouponInput] = useState('')

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return
    applyCoupon.mutate(couponInput.trim(), {
      onSuccess: () => {
        toast.success('تم تطبيق الكوبون')
        setCouponInput('')
      },
      onError: (err: any) => toast.error(err.message),
    })
  }

  const handleCheckout = () => {
    if (lines.length === 0) {
      toast.error('السلة فارغة')
      return
    }
    closeCartDrawer()
    setView('checkout')
  }

  return (
    <Sheet open={cartDrawerOpen} onOpenChange={closeCartDrawer}>
      <SheetContent side="left" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="size-5 text-primary" />
              سلة التسوق
              {summary && <span className="text-sm text-muted-foreground">({summary.itemCount})</span>}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={closeCartDrawer} className="size-8">
              <X className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        {isLoading && lines.length === 0 ? (
          <div className="flex-1 grid place-items-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : lines.length === 0 ? (
          <div className="flex-1 grid place-items-center px-6 text-center">
            <div>
              <div className="size-24 mx-auto rounded-full bg-muted grid place-items-center mb-4">
                <ShoppingBag className="size-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">سلتك فارغة</h3>
              <p className="text-sm text-muted-foreground mb-6">ابدأ التسوق وأضف منتجاتك المفضلة</p>
              <Button onClick={() => { closeCartDrawer(); setView('products') }} className="gap-2">
                تصفح المنتجات <ArrowLeft className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            {summary && summary.subtotal < 5000 && (
              <div className="px-5 py-3 bg-accent/50 border-b border-border">
                <div className="flex items-center gap-2 text-xs mb-1.5">
                  <Truck className="size-4 text-primary" />
                  <span>أضف {formatPrice(5000 - summary.subtotal)} للحصول على شحن مجاني</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (summary.subtotal / 5000) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Lines */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              <AnimatePresence>
                {lines.map(line => (
                  <motion.div
                    key={line.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="flex gap-3 p-2 rounded-xl hover:bg-accent/50 transition-colors"
                  >
                    <div className="size-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                      {line.imageUrl && (
                        <img src={line.imageUrl} alt={line.name} className="size-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold line-clamp-2">{line.name}</h4>
                      {line.variantName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{line.variantName}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 border rounded-lg">
                          <button
                            onClick={() => updateCart.mutate({ lineId: line.id, quantity: line.quantity - 1 })}
                            disabled={line.quantity <= 1 || updateCart.isPending}
                            className="size-7 grid place-items-center hover:bg-accent rounded-r-lg disabled:opacity-50"
                            aria-label="إنقاص"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{line.quantity}</span>
                          <button
                            onClick={() => updateCart.mutate({ lineId: line.id, quantity: line.quantity + 1 })}
                            disabled={line.quantity >= line.maxQuantity || updateCart.isPending}
                            className="size-7 grid place-items-center hover:bg-accent rounded-l-lg disabled:opacity-50"
                            aria-label="زيادة"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <span className="font-bold text-sm text-primary">{formatPrice(line.price * line.quantity)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCart.mutate(line.id)}
                      className="size-8 grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                      aria-label="حذف"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Coupon */}
            <div className="px-5 py-3 border-t border-border bg-card">
              {couponCode ? (
                <div className="flex items-center justify-between bg-success/10 border border-success/20 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-success" />
                    <div>
                      <div className="text-sm font-semibold">{couponCode}</div>
                      {couponMessage && <div className="text-xs text-success">{couponMessage}</div>}
                    </div>
                  </div>
                  <button onClick={() => removeCoupon.mutate()} className="text-xs text-destructive hover:underline">
                    إزالة
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="كود الخصم"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    className="h-9"
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <Button size="sm" variant="secondary" onClick={handleApplyCoupon} disabled={applyCoupon.isPending} className="h-9">
                    {applyCoupon.isPending ? <Loader2 className="size-4 animate-spin" /> : 'تطبيق'}
                  </Button>
                </div>
              )}
            </div>

            {/* Summary */}
            {summary && (
              <div className="px-5 py-4 border-t border-border bg-card space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium">{formatPrice(summary.subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>الخصم</span>
                    <span>- {formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الشحن</span>
                  <span className="font-medium">{summary.shippingCost === 0 ? 'يُحسب عند الدفع' : formatPrice(summary.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>الإجمالي</span>
                  <span className="text-primary">{formatPrice(summary.total)}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full h-12 mt-2 gap-2 shadow-glow" size="lg">
                  إتمام الطلب <ArrowLeft className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
