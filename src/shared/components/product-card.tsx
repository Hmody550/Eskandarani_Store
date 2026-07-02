/**
 * ProductCard — modern, animated, accessible.
 * FIXED: native <img> for fast loading (no next/image dev overhead).
 */
'use client'

import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, Zap, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/shared/stores/ui.store'
import { useWishlistStore } from '@/shared/stores/wishlist.store'
import { useAddToCart } from '@/shared/hooks/queries'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProductCardData } from '@/types'
import { toast } from 'sonner'
import { useState } from 'react'

export function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const { setView, addRecentlyViewed, openCartDrawer } = useUIStore()
  const wishlist = useWishlistStore()
  const addToCart = useAddToCart()
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const inWishlist = wishlist.has(product.id)

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!product.inStock) {
      toast.error('المنتج غير متوفر حالياً')
      return
    }
    addToCart.mutate({
      productId: product.id,
      variantId: null,
      quantity: 1,
    }, {
      onSuccess: () => {
        setAdded(true)
        toast.success('تمت الإضافة للسلة', { description: product.name })
        openCartDrawer()
        setTimeout(() => setAdded(false), 1500)
      },
      onError: (err: any) => toast.error(err.message),
    })
  }

  const goToProduct = () => {
    addRecentlyViewed(product.id)
    setView('product-detail', { productSlug: product.slug })
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden card-hover"
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-start">
        {product.discountPercent && (
          <Badge className="badge-sale shadow-soft">خصم {product.discountPercent}%</Badge>
        )}
        {product.isNewArrival && (
          <Badge className="badge-new shadow-soft">جديد</Badge>
        )}
        {product.isBestSeller && (
          <Badge className="badge-best shadow-soft flex items-center gap-1">
            <Zap className="size-3" /> الأكثر مبيعاً
          </Badge>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); wishlist.toggle(product.id) }}
        className={cn(
          "absolute top-3 left-3 z-10 size-9 rounded-full grid place-items-center transition-all",
          inWishlist ? "bg-destructive text-destructive-foreground shadow-soft" : "bg-background/80 backdrop-blur hover:bg-background"
        )}
        aria-label="أضف للمفضلة"
      >
        <Heart className={cn("size-4", inWishlist && "fill-current")} />
      </button>

      {/* Image — FIXED: native img for instant loading */}
      <div onClick={goToProduct} className="block w-full aspect-square relative overflow-hidden bg-muted/20 cursor-pointer" aria-label={product.name}>
        {!imgError && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="size-full grid place-items-center text-muted-foreground">
            <ShoppingCart className="size-10" />
          </div>
        )}
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-3 lg:p-4">
        {product.brandName && (
          <div className="text-[11px] text-muted-foreground mb-1 font-medium">{product.brandName}</div>
        )}
        <button onClick={goToProduct} className="block text-right w-full">
          <h3 className="font-semibold text-sm lg:text-base line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </button>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2 text-xs">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className={cn(
                  "size-3.5",
                  i <= Math.round(product.rating) ? "text-warning fill-warning" : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className="text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="flex flex-col">
            <span className="font-bold text-base lg:text-lg text-primary">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
          <Button
            size="icon"
            onClick={handleQuickAdd}
            disabled={!product.inStock || addToCart.isPending || added}
            className="size-10 rounded-xl shrink-0 shadow-soft"
            aria-label="أضف للسلة"
          >
            {added ? <Check className="size-5" /> : <ShoppingCart className="size-5" />}
          </Button>
        </div>

        {!product.inStock && (
          <div className="mt-2 text-xs text-destructive font-medium text-center py-1 bg-destructive/10 rounded-lg">
            غير متوفر حالياً
          </div>
        )}
      </div>
    </motion.article>
  )
}

// Skeleton for loading
export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="aspect-square skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 skeleton-shimmer rounded" />
        <div className="h-4 w-full skeleton-shimmer rounded" />
        <div className="h-4 w-2/3 skeleton-shimmer rounded" />
        <div className="h-3 w-1/2 skeleton-shimmer rounded" />
        <div className="flex justify-between items-center">
          <div className="h-6 w-20 skeleton-shimmer rounded" />
          <div className="size-10 skeleton-shimmer rounded-xl" />
        </div>
      </div>
    </div>
  )
}
