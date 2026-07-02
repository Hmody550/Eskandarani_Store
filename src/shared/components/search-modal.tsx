/**
 * SearchModal — instant search with results.
 */
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useUIStore } from '@/shared/stores/ui.store'
import { useProducts } from '@/shared/hooks/queries'
import { Input } from '@/components/ui/input'
import { Search, X, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/format'
import { motion, AnimatePresence } from 'framer-motion'

const POPULAR_SEARCHES = ['iPhone 15', 'Samsung S24', 'AirPods', 'سماعات', 'شواحن']

export function SearchModal() {
  const { searchModalOpen, closeSearchModal, setView, setProductFilters } = useUIStore()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(t)
  }, [query])

  // Close on Escape handled by Dialog

  const { data, isFetching } = useProducts({ search: debounced, limit: 6 }, debounced.length >= 2)

  const handleSelect = (slug?: string) => {
    closeSearchModal()
    setQuery('')
    if (slug) {
      setView('product-detail', { productSlug: slug })
    } else {
      setProductFilters({ search: debounced })
      setView('products')
    }
  }

  return (
    <Dialog open={searchModalOpen} onOpenChange={(o) => !o && closeSearchModal()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle className="sr-only">البحث</DialogTitle>
          <DialogDescription className="sr-only">ابحث عن منتجات في المتجر</DialogDescription>
          <div className="flex items-center gap-2">
            <Search className="size-5 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="ابحث عن منتج، ماركة، فئة..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSelect()}
              className="border-0 shadow-none focus-visible:ring-0 h-9 px-0 text-base"
            />
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <TrendingUp className="size-4 text-primary" />
                عمليات بحث شائعة
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-3 py-1.5 rounded-full bg-secondary hover:bg-accent text-sm transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : isFetching ? (
            <div className="p-8 text-center text-muted-foreground text-sm">جاري البحث...</div>
          ) : data && data.items.length > 0 ? (
            <div className="py-2">
              <AnimatePresence>
                {data.items.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelect(item.slug)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-right"
                  >
                    <div className="size-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="size-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.brandName}</div>
                    </div>
                    <div className="text-sm font-bold text-primary shrink-0">{formatPrice(item.price)}</div>
                  </motion.button>
                ))}
              </AnimatePresence>
              <button
                onClick={() => handleSelect()}
                className="w-full text-center py-3 text-sm text-primary hover:bg-accent transition-colors border-t border-border mt-2"
              >
                عرض كل النتائج ({data.total})
              </button>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-sm mb-1">لا توجد نتائج لـ "{query}"</p>
              <p className="text-xs text-muted-foreground">جرّب كلمات مختلفة أو تصفح الأقسام</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
