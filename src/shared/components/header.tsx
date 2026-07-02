/**
 * Header — sticky, glassmorphism, RTL-aware with mega-menu hint, search, cart, theme.
 */
'use client'

import Link from 'next/link'
import { useUIStore } from '@/shared/stores/ui.store'
import { useCartStore } from '@/shared/stores/cart.store'
import { useWishlistStore } from '@/shared/stores/wishlist.store'
import { useHomeData } from '@/shared/hooks/queries'
import { ShoppingCart, Heart, Search, Menu, Moon, Sun, Smartphone, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Header() {
  const { setView, openSearchModal, toggleMobileMenu, theme, toggleTheme, view } = useUIStore()
  const { summary } = useCartStore()
  const wishlistCount = useWishlistStore(s => s.productIds.length)
  const { data: home } = useHomeData()
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)

  const cartCount = summary?.itemCount ?? 0

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar — Royal Blue premium */}
      <div className="gradient-royal text-white text-xs">
        <div className="container-x flex items-center justify-between h-9">
          <p className="flex items-center gap-2 font-semibold">
            <span className="hidden sm:inline">الاسكندراني</span>
            <span className="sm:hidden">الاسكندراني</span>
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => setView('order-tracking')} className="hover:text-gold-light transition-colors">
              تتبع طلبك
            </button>
            {/* SECURITY: Admin access removed from public UI.
                Access via URL hash #admin or keyboard shortcut Ctrl+Shift+A */}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="glass border-b border-border/60">
        <div className="container-x flex items-center gap-4 h-16 lg:h-20">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="القائمة">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-right">القائمة</SheetTitle>
              </SheetHeader>
              <MobileNav />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 shrink-0 group"
            aria-label="أسكندراني فون"
          >
            <div className="relative size-11 lg:size-12 rounded-full overflow-hidden shadow-glow ring-1 ring-gold/30 group-hover:ring-gold/60 transition-all">
              {/* Static version param for cache busting (avoids hydration error from Date.now()) */}
              <img src="/askandarani-brand-logo.svg" alt="أسكندراني فون" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block text-right leading-tight">
              <div className="font-display font-extrabold text-base lg:text-lg gradient-text">أسكندراني فون</div>
              <div className="text-[10px] text-muted-foreground tracking-widest">PREMIUM · EGYPT</div>
            </div>
          </button>

          {/* Search bar */}
          <div
            onClick={openSearchModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openSearchModal()}
            className="flex-1 max-w-2xl mx-auto group cursor-pointer"
            aria-label="بحث"
          >
            <div className="hidden md:flex items-center gap-3 h-11 px-4 rounded-full bg-secondary/80 hover:bg-secondary transition-colors text-muted-foreground">
              <Search className="size-4" />
              <span className="text-sm">ابحث عن هاتف، ماركة، إكسسوار...</span>
              <kbd className="mr-auto text-[10px] px-1.5 py-0.5 rounded border bg-background">/</kbd>
            </div>
            <div className="md:hidden size-10 grid place-items-center hover:bg-accent rounded-lg transition-colors" aria-label="بحث">
              <Search className="size-5" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 lg:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
              className="relative"
            >
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('account')}
              aria-label="المفضلة"
              className="relative"
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-0.5 -left-0.5 size-4 p-0 text-[10px] justify-center badge-sale">
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => useUIStore.getState().openCartDrawer()}
              className="relative h-10 px-3 lg:px-4 gap-2 shadow-soft"
              aria-label="سلة التسوق"
            >
              <ShoppingCart className="size-5" />
              <span className="hidden lg:inline font-semibold">السلة</span>
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -left-1 size-5 p-0 text-[10px] justify-center bg-background text-primary border-2 border-primary">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Categories nav — desktop */}
        <nav className="hidden lg:block border-t border-border/40">
          <div className="container-x flex items-center gap-1 h-12">
            <button
              onClick={() => setView('products')}
              className={cn(
                "px-3 h-8 rounded-lg text-sm font-medium hover:bg-accent transition-colors",
                view === 'products' && !useUIStore.getState().productFilters.categoryIds?.length && 'bg-accent text-accent-foreground'
              )}
            >
              كل المنتجات
            </button>
            {home?.categories.slice(0, 7).map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  useUIStore.getState().setProductFilters({ categoryIds: [cat.id], search: undefined })
                  setView('products')
                }}
                onMouseEnter={() => setHoveredCat(cat.id)}
                onMouseLeave={() => setHoveredCat(null)}
                className="px-3 h-8 rounded-lg text-sm font-medium hover:bg-accent transition-colors flex items-center gap-1 relative cursor-pointer"
              >
                {cat.name}
                {cat.children.length > 0 && <ChevronDown className="size-3" />}
                <AnimatePresence>
                  {hoveredCat === cat.id && cat.children.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1 w-56 p-2 glass rounded-xl shadow-elevated border"
                    >
                      {cat.children.map(child => (
                        <button
                          key={child.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            useUIStore.getState().setProductFilters({ categoryIds: [child.id] })
                            setView('products')
                          }}
                          className="w-full text-right px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                        >
                          {child.name}
                          <span className="text-xs text-muted-foreground mr-2">({child.productCount})</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <button
              onClick={() => {
                useUIStore.getState().setProductFilters({ isOnSale: true })
                setView('products')
              }}
              className="px-3 h-8 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors mr-auto"
            >
              العروض 🔥
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}

function MobileNav() {
  const { setView, resetFilters } = useUIStore()
  const { data: home } = useHomeData()

  const go = (view: any, filters?: any) => {
    resetFilters()
    if (filters) useUIStore.getState().setProductFilters(filters)
    setView(view)
  }

  return (
    <nav className="flex flex-col gap-1 mt-4">
      <button onClick={() => go('home')} className="text-right px-3 py-2.5 rounded-lg hover:bg-accent font-medium">الرئيسية</button>
      <button onClick={() => go('products')} className="text-right px-3 py-2.5 rounded-lg hover:bg-accent font-medium">كل المنتجات</button>
      <div className="px-3 py-2 text-xs text-muted-foreground mt-2">الأقسام</div>
      {home?.categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => go('products', { categoryIds: [cat.id] })}
          className="text-right px-3 py-2 rounded-lg hover:bg-accent text-sm"
        >
          {cat.name} <span className="text-xs text-muted-foreground">({cat.productCount})</span>
        </button>
      ))}
      <div className="px-3 py-2 text-xs text-muted-foreground mt-2">حسابي</div>
      <button onClick={() => go('account')} className="text-right px-3 py-2.5 rounded-lg hover:bg-accent font-medium">المفضلة والطلبات</button>
      <button onClick={() => go('order-tracking')} className="text-right px-3 py-2.5 rounded-lg hover:bg-accent font-medium">تتبع الطلب</button>
      {/* SECURITY: Admin link removed from mobile nav — access via #admin only */}
    </nav>
  )
}
