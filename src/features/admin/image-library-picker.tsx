/**
 * ImageLibraryPicker — smart, modern image picker from the site's library.
 * Features:
 * - Search by name/category
 * - Filter by category tabs
 * - Grid preview with hover effects
 * - Upload from device (optional secondary option)
 * - Selection confirmation
 * - Premium UI with the Royal + Gold theme
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Upload, Image as ImageIcon, Check, Loader2, X, Sparkles, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUploadImage } from '@/shared/hooks/admin-queries'
import { toast } from 'sonner'

interface LibraryImage {
  url: string
  name: string
  category: string
  categoryLabel: string
}

interface Category {
  value: string
  label: string
  count: number
}

interface ImageLibraryPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
  type?: 'products' | 'brands' | 'categories'
  title?: string
}

export function ImageLibraryPicker({ open, onOpenChange, onSelect, type = 'products', title = 'اختيار صورة من المكتبة' }: ImageLibraryPickerProps) {
  const [images, setImages] = useState<LibraryImage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadImage()

  // Fetch library images
  const fetchImages = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (activeCategory !== 'all') params.set('category', activeCategory)
      const res = await fetch(`/api/library?${params}`)
      if (!res.ok) throw new Error('فشل')
      const data = await res.json()
      setImages(data.images ?? [])
      if (data.categories && categories.length === 0) {
        setCategories(data.categories)
      }
    } catch (e) {
      // Fallback: show empty
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [search, activeCategory])

  useEffect(() => {
    if (open) fetchImages()
  }, [open, fetchImages])

  // Debounce search
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => fetchImages(), 300)
    return () => clearTimeout(t)
  }, [search, activeCategory, open])

  const handleSelect = () => {
    if (!selectedUrl) {
      toast.error('يرجى اختيار صورة أولاً')
      return
    }
    onSelect(selectedUrl)
    setSelectedUrl(null)
    onOpenChange(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await upload.mutateAsync({ file, type })
      onSelect(result.url)
      onOpenChange(false)
      toast.success('تم رفع الصورة بنجاح')
    } catch (err: any) {
      toast.error(err.message ?? 'فشل رفع الصورة')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-l from-accent/30 to-transparent shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="size-9 rounded-xl gradient-gold grid place-items-center">
              <Sparkles className="size-5 text-gold-foreground" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Search bar */}
        <div className="px-6 py-3 border-b border-border shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث في المكتبة... (مثلاً: iphone, case, charger)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2 shrink-0"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              <span className="hidden sm:inline">رفع من جهازي</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-6 py-2 border-b border-border shrink-0 overflow-x-auto no-scrollbar">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="h-auto p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg text-xs gap-1">
                <FolderOpen className="size-3" /> الكل
              </TabsTrigger>
              {categories.filter(c => c.count > 0).map(cat => (
                <TabsTrigger key={cat.value} value={cat.value} className="rounded-lg text-xs gap-1">
                  {cat.label} ({cat.count})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Image grid */}
        <ScrollArea className="flex-1 max-h-[55vh]">
          <div className="p-4">
            {loading ? (
              <div className="grid place-items-center py-16">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground mt-2">جاري تحميل المكتبة...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-16">
                <ImageIcon className="size-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">لا توجد صور مطابقة</p>
                <p className="text-xs text-muted-foreground mt-1">جرّب كلمة بحث أخرى أو فئة مختلفة</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {images.map((img, i) => (
                  <button
                    key={`${img.url}-${i}`}
                    onClick={() => setSelectedUrl(img.url)}
                    className={cn(
                      'relative aspect-square rounded-xl overflow-hidden border-2 transition-all group bg-muted/20',
                      selectedUrl === img.url
                        ? 'border-primary shadow-glow ring-2 ring-primary/30'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Selected overlay */}
                    {selectedUrl === img.url && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-glow">
                          <Check className="size-6" />
                        </div>
                      </div>
                    )}
                    {/* Name overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-[10px] text-white font-medium line-clamp-1">{img.name}</div>
                      <div className="text-[8px] text-white/70">{img.categoryLabel}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-card shrink-0">
          <div className="text-xs text-muted-foreground">
            {selectedUrl ? (
              <span className="flex items-center gap-1 text-primary">
                <Check className="size-3" /> تم اختيار صورة
              </span>
            ) : (
              <span>{images.length} صورة متاحة</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setSelectedUrl(null); onOpenChange(false) }} className="gap-1">
              <X className="size-4" /> إلغاء
            </Button>
            <Button onClick={handleSelect} disabled={!selectedUrl} className="gap-2 shadow-glow">
              <Check className="size-4" /> تأكيد الاختيار
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
