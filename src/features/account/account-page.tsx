/**
 * AccountPage — wishlist, recently viewed, recent orders (lookup).
 */
'use client'

import { useWishlistStore } from '@/shared/stores/wishlist.store'
import { useUIStore } from '@/shared/stores/ui.store'
import { useProducts } from '@/shared/hooks/queries'
import { ProductCard } from '@/shared/components/product-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Clock, Package, Trash2, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function AccountPage() {
  const { productIds, remove, clear } = useWishlistStore()
  const { recentlyViewed, setView } = useUIStore()
  const [tab, setTab] = useState<'wishlist' | 'recently' | 'orders'>('wishlist')

  const wishlistQuery = useProducts({}, productIds.length === 0)
  const recentlyQuery = useProducts({}, recentlyViewed.length === 0)

  const wishlistProducts = (wishlistQuery.data?.items ?? []).filter(p => productIds.includes(p.id))
  const recentlyProducts = (recentlyQuery.data?.items ?? []).filter(p => recentlyViewed.includes(p.id))

  return (
    <div className="container-x section-y-sm">
      <h1 className="font-display text-2xl lg:text-3xl font-extrabold mb-6">حسابي</h1>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <aside>
          <Card className="p-2">
            <button
              onClick={() => setTab('wishlist')}
              className={`w-full text-right p-3 rounded-xl flex items-center gap-2 text-sm transition-colors ${
                tab === 'wishlist' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              <Heart className="size-4" /> المفضلة ({productIds.length})
            </button>
            <button
              onClick={() => setTab('recently')}
              className={`w-full text-right p-3 rounded-xl flex items-center gap-2 text-sm transition-colors ${
                tab === 'recently' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              <Clock className="size-4" /> شوهد مؤخراً ({recentlyViewed.length})
            </button>
            <button
              onClick={() => setTab('orders')}
              className={`w-full text-right p-3 rounded-xl flex items-center gap-2 text-sm transition-colors ${
                tab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              <Package className="size-4" /> طلباتي
            </button>
          </Card>
        </aside>

        {/* Content */}
        <div>
          {tab === 'wishlist' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">قائمة المفضلة</h2>
                {productIds.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => { clear(); toast.success('تم مسح القائمة') }} className="text-destructive gap-1">
                    <Trash2 className="size-4" /> مسح الكل
                  </Button>
                )}
              </div>
              {productIds.length === 0 ? (
                <Card className="p-12 text-center">
                  <Heart className="size-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-1">قائمة المفضلة فارغة</h3>
                  <p className="text-sm text-muted-foreground mb-4">أضف منتجاتك المفضلة للوصول السريع إليها</p>
                  <Button onClick={() => setView('products')} className="gap-2">
                    <ShoppingCart className="size-4" /> تصفح المنتجات
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                  {wishlistProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              )}
            </div>
          )}

          {tab === 'recently' && (
            <div>
              <h2 className="font-bold text-lg mb-4">شوهد مؤخراً</h2>
              {recentlyViewed.length === 0 ? (
                <Card className="p-12 text-center">
                  <Clock className="size-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-1">لا توجد منتجات</h3>
                  <p className="text-sm text-muted-foreground">المنتجات التي تشاهدها ستظهر هنا</p>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                  {recentlyProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div>
              <h2 className="font-bold text-lg mb-4">طلباتي</h2>
              <Card className="p-8 text-center">
                <Package className="size-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">تتبع طلباتك</h3>
                <p className="text-sm text-muted-foreground mb-4">استخدم رقم الطلب والبريد الإلكتروني لتتبع طلباتك</p>
                <Button onClick={() => setView('order-tracking')} className="gap-2">
                  <Package className="size-4" /> تتبع طلب
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
