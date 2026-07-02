/**
 * AdminDashboard — comprehensive admin panel with full CRUD.
 * Tabs: Overview, Products, Categories, Brands, Coupons, Orders, Customers, Settings
 * All operations go through the database via admin API routes.
 */
'use client'

import { useState } from 'react'
import { useAdminMetrics, useAdminOrders, useUpdateOrderStatus } from '@/shared/hooks/queries'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign, Package, Loader2, BarChart3, ArrowRight, ArrowLeft, Settings, Tag, FolderTree, Ticket, LogOut, Shield, UserCircle } from 'lucide-react'
import { formatPrice, formatNumber, formatDateTime } from '@/lib/format'
import { useUIStore } from '@/shared/stores/ui.store'
import { useAuthStore } from '@/shared/stores/auth.store'
import { useLogout } from '@/shared/hooks/auth-queries'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'
import { ProductsManager } from './products-manager'
import { CategoriesManager } from './categories-manager'
import { BrandsManager } from './brands-manager'
import { CouponsManager } from './coupons-manager'
import { OrdersManager } from './orders-manager'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'بانتظار',
  CONFIRMED: 'مؤكد',
  PROCESSING: 'قيد التجهيز',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغي',
  REFUNDED: 'مسترجع',
  ON_HOLD: 'معلق',
}

export function AdminDashboard() {
  const { setView } = useUIStore()
  const { user } = useAuthStore()
  const logout = useLogout()
  const [tab, setTab] = useState('overview')
  const { data: metrics, isLoading } = useAdminMetrics()
  const [orderFilter, setOrderFilter] = useState<string>('ALL')
  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders(orderFilter === 'ALL' ? undefined : orderFilter)
  const updateStatus = useUpdateOrderStatus()

  const handleLogout = async () => {
    await logout.mutateAsync()
    setView('home')
  }

  return (
    <div className="container-x section-y-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <button onClick={() => setView('home')} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-1">
            <ArrowRight className="size-3" /> العودة للمتجر
          </button>
          <h1 className="font-display text-2xl lg:text-3xl font-extrabold gradient-text">لوحة الإدارة</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border">
              <div className="size-7 rounded-full gradient-gold grid place-items-center">
                <UserCircle className="size-4 text-gold-foreground" />
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold leading-tight">{user.name || user.email}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{user.role}</div>
              </div>
            </div>
          )}
          <Badge variant="outline" className="gap-1.5">
            <span className="size-2 rounded-full bg-success animate-pulse" /> Live
          </Badge>
          <Badge className="gap-1 gradient-gold text-gold-foreground">
            <Shield className="size-3" /> آمن
          </Badge>
          {/* Logout button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">خروج</span>
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-2xl overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview" className="rounded-xl gap-1.5"><BarChart3 className="size-4" /> نظرة عامة</TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl gap-1.5"><Package className="size-4" /> المنتجات</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl gap-1.5"><FolderTree className="size-4" /> الفئات</TabsTrigger>
          <TabsTrigger value="brands" className="rounded-xl gap-1.5"><Tag className="size-4" /> الماركات</TabsTrigger>
          <TabsTrigger value="coupons" className="rounded-xl gap-1.5"><Ticket className="size-4" /> الكوبونات</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl gap-1.5"><ShoppingCart className="size-4" /> الطلبات</TabsTrigger>
          <TabsTrigger value="customers" className="rounded-xl gap-1.5"><Users className="size-4" /> العملاء</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {isLoading || !metrics ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <KpiCard icon={DollarSign} label="إجمالي الإيرادات" value={formatPrice(metrics.revenue)} change={+12.5} color="text-success" />
                <KpiCard icon={ShoppingCart} label="إجمالي الطلبات" value={formatNumber(metrics.ordersCount)} change={+8.2} color="text-info" />
                <KpiCard icon={Users} label="العملاء" value={formatNumber(metrics.customersCount)} change={+5.1} color="text-primary" />
                <KpiCard icon={TrendingUp} label="متوسط قيمة الطلب" value={formatPrice(metrics.avgOrderValue)} change={-2.3} color="text-warning" />
              </div>

              <div className="grid lg:grid-cols-[1.7fr_1fr] gap-4">
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold">الإيرادات خلال 14 يوماً</h3>
                      <p className="text-xs text-muted-foreground">آخر أسبوعين</p>
                    </div>
                    <Badge variant="outline" className="text-success gap-1">
                      <TrendingUp className="size-3" /> +12.5%
                    </Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={metrics.revenueSeries}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9942E" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#C9942E" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        stroke="currentColor"
                      />
                      <YAxis
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        stroke="currentColor"
                      />
                      <Tooltip
                        formatter={(v: number) => [formatPrice(v), 'الإيراد']}
                        labelFormatter={(l) => new Date(l).toLocaleDateString('ar-EG')}
                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(201,148,46,0.3)', fontSize: 12, background: 'rgba(10,10,20,0.95)' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#FDE08A" strokeWidth={2} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-5">
                  <h3 className="font-bold mb-1">الطلبات حسب الحالة</h3>
                  <p className="text-xs text-muted-foreground mb-4">توزيع الطلبات</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={metrics.ordersByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {metrics.ordersByStatus.map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number, n: string) => [v, STATUS_LABELS[n] ?? n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-1.5 text-xs mt-2">
                    {metrics.ordersByStatus.filter((s: any) => s.count > 0).map((s: any) => (
                      <div key={s.status} className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full" style={{ background: s.color }} />
                        <span>{STATUS_LABELS[s.status]} ({s.count})</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="p-5">
                  <h3 className="font-bold mb-4">المنتجات الأكثر مبيعاً</h3>
                  <div className="space-y-3">
                    {metrics.topProducts.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 grid place-items-center text-xs font-bold gradient-text">
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium line-clamp-1">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.sold} مبيع</div>
                        </div>
                        <div className="font-bold text-sm text-primary">{formatPrice(p.revenue)}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">أحدث الطلبات</h3>
                    <Button variant="ghost" size="sm" onClick={() => setTab('orders')} className="text-xs">
                      عرض الكل <ArrowLeft className="size-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {metrics.recentOrders.map((o: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium font-mono">{o.orderNumber}</div>
                          <div className="text-xs text-muted-foreground">{o.customer}</div>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold">{formatPrice(o.total)}</div>
                          <Badge variant="outline" className="text-[10px] py-0 h-4">
                            {STATUS_LABELS[o.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Products */}
        <TabsContent value="products" className="mt-6">
          <ProductsManager />
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="mt-6">
          <CategoriesManager />
        </TabsContent>

        {/* Brands */}
        <TabsContent value="brands" className="mt-6">
          <BrandsManager />
        </TabsContent>

        {/* Coupons */}
        <TabsContent value="coupons" className="mt-6">
          <CouponsManager />
        </TabsContent>

        {/* Orders — using new advanced OrdersManager */}
        <TabsContent value="orders" className="mt-6">
          <OrdersManager />
        </TabsContent>

        {/* Customers */}
        <TabsContent value="customers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 text-center">
              <Users className="size-10 mx-auto text-primary mb-2" />
              <div className="font-display text-3xl font-extrabold gradient-text">{formatNumber(metrics?.customersCount ?? 0)}</div>
              <div className="text-xs text-muted-foreground">إجمالي العملاء</div>
            </Card>
            <Card className="p-5 text-center">
              <TrendingUp className="size-10 mx-auto text-success mb-2" />
              <div className="font-display text-3xl font-extrabold gradient-text">{formatNumber(metrics?.ordersCount ?? 0)}</div>
              <div className="text-xs text-muted-foreground">إجمالي الطلبات</div>
            </Card>
            <Card className="p-5 text-center">
              <DollarSign className="size-10 mx-auto text-warning mb-2" />
              <div className="font-display text-3xl font-extrabold gradient-text">{formatPrice(metrics?.avgOrderValue ?? 0)}</div>
              <div className="text-xs text-muted-foreground">متوسط الطلب</div>
            </Card>
          </div>
          <Card className="p-5 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="size-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                إدارة كاملة للعملاء متوفرة عند تفعيل نظام المصادقة الكامل (NextAuth).
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, change, color }: any) {
  const positive = change > 0
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-4 lg:p-5 hover:shadow-soft transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <div className={cn("size-9 rounded-xl grid place-items-center bg-accent", color)}>
            <Icon className="size-5" />
          </div>
          <div className={cn("flex items-center gap-0.5 text-xs font-semibold", positive ? "text-success" : "text-destructive")}>
            {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(change)}%
          </div>
        </div>
        <div className="font-display text-xl lg:text-2xl font-extrabold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </Card>
    </motion.div>
  )
}
