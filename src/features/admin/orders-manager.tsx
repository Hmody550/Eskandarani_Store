/**
 * OrdersManager — advanced orders management for admin dashboard.
 * Features: detailed view, quick approve/reject, timeline, stats, search.
 */
'use client'

import { useState } from 'react'
import { useAdminOrders, useUpdateOrderStatus } from '@/shared/hooks/queries'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Search, Loader2, ShoppingCart, Check, X, Eye, Clock, MapPin, CreditCard, Package, TrendingUp, AlertCircle, User, Mail, Phone, Truck, CheckCircle2 } from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/format'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: 'بانتظار', color: 'text-warning', bg: 'bg-warning/10 border-warning/30', icon: Clock },
  CONFIRMED: { label: 'مؤكد', color: 'text-info', bg: 'bg-info/10 border-info/30', icon: Check },
  PROCESSING: { label: 'قيد التجهيز', color: 'text-info', bg: 'bg-info/10 border-info/30', icon: Package },
  SHIPPED: { label: 'تم الشحن', color: 'text-info', bg: 'bg-info/10 border-info/30', icon: Truck },
  DELIVERED: { label: 'تم التوصيل', color: 'text-success', bg: 'bg-success/10 border-success/30', icon: CheckCircle2 },
  CANCELLED: { label: 'ملغي', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: X },
  REFUNDED: { label: 'مسترجع', color: 'text-muted-foreground', bg: 'bg-muted/10 border-muted/30', icon: AlertCircle },
  ON_HOLD: { label: 'معلق', color: 'text-warning', bg: 'bg-warning/10 border-warning/30', icon: Clock },
}

export function OrdersManager() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  const { data, isLoading } = useAdminOrders(statusFilter === 'ALL' ? undefined : statusFilter)
  const updateStatus = useUpdateOrderStatus()

  const orders = data?.orders ?? []
  const filteredOrders = orders.filter((o: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.guestEmail?.toLowerCase().includes(q) ||
      o.address?.firstName?.toLowerCase().includes(q) ||
      o.address?.lastName?.toLowerCase().includes(q) ||
      o.address?.phone?.includes(q)
    )
  })

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o: any) => o.status === 'PENDING').length,
    confirmed: orders.filter((o: any) => ['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status)).length,
    delivered: orders.filter((o: any) => o.status === 'DELIVERED').length,
    revenue: orders.filter((o: any) => o.status !== 'CANCELLED').reduce((s: number, o: any) => s + o.total, 0),
  }

  const handleStatusChange = (orderId: string, status: string) => {
    updateStatus.mutate({ orderId, status }, {
      onSuccess: () => {
        toast.success(`تم تحديث حالة الطلب إلى: ${STATUS_CONFIG[status]?.label}`)
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status })
        }
      },
      onError: (e: any) => toast.error(e.message),
    })
  }

  const handleApprove = (orderId: string) => handleStatusChange(orderId, 'CONFIRMED')
  const handleReject = (orderId: string) => handleStatusChange(orderId, 'CANCELLED')
  const handleShip = (orderId: string) => handleStatusChange(orderId, 'SHIPPED')
  const handleDeliver = (orderId: string) => handleStatusChange(orderId, 'DELIVERED')

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={ShoppingCart} label="إجمالي" value={stats.total} color="text-primary" />
        <StatCard icon={Clock} label="بانتظار" value={stats.pending} color="text-warning" />
        <StatCard icon={Package} label="قيد التنفيذ" value={stats.confirmed} color="text-info" />
        <StatCard icon={CheckCircle2} label="مكتمل" value={stats.delivered} color="text-success" />
        <StatCard icon={TrendingUp} label="الإيرادات" value={formatPrice(stats.revenue)} color="text-primary" small />
      </div>

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="size-5 text-primary" /> إدارة الطلبات ({filteredOrders.length})
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث برقم الطلب، الاسم، الهاتف..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pr-9 w-full sm:w-64 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">كل الحالات</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Loader2 className="size-8 animate-spin text-primary" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="size-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">لا توجد طلبات مطابقة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المنتجات</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات سريعة</TableHead>
                  <TableHead>تفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((o: any) => {
                  const config = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.PENDING
                  const itemCount = o.items?.reduce((s: number, i: any) => s + i.quantity, 0) ?? 0
                  return (
                    <TableRow key={o.id} className="hover:bg-accent/30">
                      <TableCell className="font-mono text-xs font-bold">{o.orderNumber}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{o.address ? `${o.address.firstName} ${o.address.lastName}` : 'عميل'}</div>
                        <div className="text-xs text-muted-foreground">{o.guestEmail}</div>
                      </TableCell>
                      <TableCell className="text-xs">{formatDateTime(o.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{itemCount} قطعة</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-primary">{formatPrice(o.total)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-xs', config.bg, config.color)}>
                          <config.icon className="size-3 ml-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {o.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-success hover:bg-success/10"
                                onClick={() => handleApprove(o.id)}
                                disabled={updateStatus.isPending}
                                title="موافقة"
                              >
                                <Check className="size-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-destructive hover:bg-destructive/10"
                                onClick={() => handleReject(o.id)}
                                disabled={updateStatus.isPending}
                                title="رفض"
                              >
                                <X className="size-3.5" />
                              </Button>
                            </>
                          )}
                          {o.status === 'CONFIRMED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-info hover:bg-info/10"
                              onClick={() => handleShip(o.id)}
                              disabled={updateStatus.isPending}
                              title="شحن"
                            >
                              <Truck className="size-3.5" />
                            </Button>
                          )}
                          {o.status === 'SHIPPED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-success hover:bg-success/10"
                              onClick={() => handleDeliver(o.id)}
                              disabled={updateStatus.isPending}
                              title="تأكيد التوصيل"
                            >
                              <CheckCircle2 className="size-3.5" />
                            </Button>
                          )}
                          {(o.status === 'DELIVERED' || o.status === 'CANCELLED') && (
                            <span className="text-xs text-muted-foreground px-2">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => setSelectedOrder(o)}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span className="font-mono">{selectedOrder.orderNumber}</span>
                  <Badge variant="outline" className={cn('text-xs', STATUS_CONFIG[selectedOrder.status]?.bg, STATUS_CONFIG[selectedOrder.status]?.color)}>
                    {STATUS_CONFIG[selectedOrder.status]?.label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Quick Actions */}
                {selectedOrder.status === 'PENDING' && (
                  <div className="flex gap-2 p-3 rounded-xl bg-warning/5 border border-warning/20">
                    <AlertCircle className="size-5 text-warning shrink-0" />
                    <div className="flex-1 text-sm">هذا الطلب بانتظار المراجعة</div>
                    <Button size="sm" className="gap-1 bg-success hover:bg-success/90" onClick={() => handleApprove(selectedOrder.id)}>
                      <Check className="size-4" /> موافقة
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleReject(selectedOrder.id)}>
                      <X className="size-4" /> رفض
                    </Button>
                  </div>
                )}

                {/* Customer Info */}
                <Card className="p-4">
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <User className="size-4 text-primary" /> معلومات العميل
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <span>{selectedOrder.address?.firstName} {selectedOrder.address?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" />
                      <span dir="ltr">{selectedOrder.guestEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" />
                      <span dir="ltr">{selectedOrder.address?.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span>{selectedOrder.address?.city}, {selectedOrder.address?.country}</span>
                    </div>
                  </div>
                  {selectedOrder.address?.address1 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <MapPin className="size-4 inline ml-1" />
                      {selectedOrder.address.address1}
                      {selectedOrder.address.address2 && `، ${selectedOrder.address.address2}`}
                    </div>
                  )}
                </Card>

                {/* Order Items */}
                <Card className="p-4">
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Package className="size-4 text-primary" /> المنتجات ({selectedOrder.items?.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30">
                        <div className="size-12 rounded-lg overflow-hidden bg-muted shrink-0">
                          {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                          {item.variantName && <div className="text-xs text-muted-foreground">{item.variantName}</div>}
                          <div className="text-xs text-muted-foreground">{item.quantity}× {formatPrice(item.price)}</div>
                        </div>
                        <div className="font-bold text-sm">{formatPrice(item.total)}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Payment Summary */}
                <Card className="p-4">
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <CreditCard className="size-4 text-primary" /> ملخص الدفع
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المجموع الفرعي</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>الخصم {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}</span>
                        <span>- {formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الشحن ({selectedOrder.shippingMethod})</span>
                      <span>{selectedOrder.shippingCost === 0 ? 'مجاني' : formatPrice(selectedOrder.shippingCost)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-base">
                      <span>الإجمالي</span>
                      <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </Card>

                {/* Status Update */}
                <Card className="p-4">
                  <h4 className="font-bold text-sm mb-3">تحديث حالة الطلب</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <Button
                        key={k}
                        size="sm"
                        variant={selectedOrder.status === k ? 'default' : 'outline'}
                        className={cn('gap-1', selectedOrder.status === k && v.bg, selectedOrder.status === k && v.color)}
                        onClick={() => handleStatusChange(selectedOrder.id, k)}
                        disabled={updateStatus.isPending || selectedOrder.status === k}
                      >
                        <v.icon className="size-3.5" />
                        {v.label}
                      </Button>
                    ))}
                  </div>
                </Card>

                {/* Timestamps */}
                <div className="text-xs text-muted-foreground text-center pt-2">
                  <Clock className="size-3 inline ml-1" />
                  تم إنشاء الطلب: {formatDateTime(selectedOrder.createdAt)}
                  {selectedOrder.confirmedAt && ` · تأكد: ${formatDateTime(selectedOrder.confirmedAt)}`}
                  {selectedOrder.shippedAt && ` · شُحن: ${formatDateTime(selectedOrder.shippedAt)}`}
                  {selectedOrder.deliveredAt && ` · وصل: ${formatDateTime(selectedOrder.deliveredAt)}`}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, small }: any) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        <div className={cn('size-8 rounded-lg bg-accent grid place-items-center', color)}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className={cn('font-bold truncate', small ? 'text-sm' : 'text-lg')}>{value}</div>
          <div className="text-[10px] text-muted-foreground">{label}</div>
        </div>
      </div>
    </Card>
  )
}
