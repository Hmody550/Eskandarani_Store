/**
 * ImageUpload — premium image picker that uses the site's image library.
 * Primary: pick from library (hundreds of pre-loaded professional images)
 * Secondary: upload from device (optional)
 */
'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, ImageIcon, Check, FolderOpen, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useUploadImage } from '@/shared/hooks/admin-queries'
import { ImageLibraryPicker } from './image-library-picker'
import { toast } from 'sonner'

interface ImageUploadProps {
  type: 'products' | 'brands' | 'categories'
  value: string | null
  onChange: (url: string | null) => void
  className?: string
  label?: string
}

export function ImageUpload({ type, value, onChange, className, label = 'صورة' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadImage()

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('الملف يجب أن يكون صورة')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('الحد الأقصى للملف 5 ميجابايت')
      return
    }
    setIsUploading(true)
    try {
      const result = await upload.mutateAsync({ file, type })
      onChange(result.url)
      toast.success('تم رفع الصورة')
    } finally {
      setIsUploading(false)
    }
  }, [onChange, type, upload])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <div
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={handleDrop}
        className={cn(
          'relative aspect-square w-full rounded-2xl border-2 border-dashed transition-all overflow-hidden',
          value ? 'border-solid border-gold' : 'border-border hover:border-primary/50 cursor-pointer'
        )}
        onClick={() => !value && setShowLibrary(true)}
      >
        {value ? (
          <>
            <img src={value} alt="معاينة" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowLibrary(true) }}
                className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center hover:scale-110 transition-transform"
                aria-label="تغيير من المكتبة"
              >
                <FolderOpen className="size-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                className="size-10 rounded-full bg-info text-info-foreground grid place-items-center hover:scale-110 transition-transform"
                aria-label="رفع من الجهاز"
              >
                <Upload className="size-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(null) }}
                className="size-10 rounded-full bg-destructive text-destructive-foreground grid place-items-center hover:scale-110 transition-transform"
                aria-label="حذف"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="absolute top-2 right-2 size-7 rounded-full bg-success text-success-foreground grid place-items-center">
              <Check className="size-4" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-center p-4">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-10 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">جاري الرفع...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="size-14 rounded-2xl gradient-gold grid place-items-center shadow-gold">
                  <Sparkles className="size-7 text-gold-foreground" />
                </div>
                <p className="text-sm font-semibold">اختيار من المكتبة</p>
                <p className="text-xs text-muted-foreground">مئات الصور الاحترافية الجاهزة</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  <ImageIcon className="size-3" />
                  اضغط للاختيار
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Secondary: Upload from device button */}
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full text-xs gap-1.5"
        >
          {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
          أو ارفع من جهازك
        </Button>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleSelect} className="hidden" />

      {/* Library Picker Modal */}
      <ImageLibraryPicker
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onSelect={(url) => onChange(url)}
        type={type}
        title={`اختيار ${label} من المكتبة`}
      />
    </div>
  )
}

/**
 * MultiImageUpload — for product gallery (multiple images from library)
 */
interface MultiImageUploadProps {
  type: 'products' | 'brands' | 'categories'
  images: { id?: string; url: string; altText?: string; sortOrder: number }[]
  onChange: (images: { id?: string; url: string; altText?: string; sortOrder: number }[]) => void
}

export function MultiImageUpload({ type, images, onChange }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadImage()

  const handleFiles = async (files: FileList) => {
    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        const result = await upload.mutateAsync({ file, type })
        onChange([...images, { url: result.url, sortOrder: images.length }])
      }
      toast.success(`تم رفع ${files.length} صورة`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleLibrarySelect = (url: string) => {
    onChange([...images, { url, sortOrder: images.length }])
    setShowLibrary(false)
  }

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, sortOrder: i })))
  }

  const move = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir
    if (newIndex < 0 || newIndex >= images.length) return
    const newImages = [...images]
    ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
    onChange(newImages.map((img, i) => ({ ...img, sortOrder: i })))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">صور المنتج ({images.length})</label>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="text-xs px-3 py-1.5 rounded-lg gap-1.5 shadow-gold"
          >
            <Sparkles className="size-3.5" />
            اختيار من المكتبة
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="text-xs px-3 py-1.5 rounded-lg gap-1.5"
          >
            {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            رفع من جهازي
          </Button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
      {images.length === 0 ? (
        <div
          onClick={() => setShowLibrary(true)}
          className="aspect-[2/1] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer grid place-items-center text-center p-4"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="size-12 rounded-xl gradient-gold grid place-items-center shadow-gold">
              <Sparkles className="size-6 text-gold-foreground" />
            </div>
            <p className="text-sm font-semibold">اختيار من المكتبة</p>
            <p className="text-xs text-muted-foreground">مئات الصور الاحترافية الجاهزة</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
              <img src={img.url} alt={img.altText ?? `صورة ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="size-7 rounded-md bg-primary/80 text-primary-foreground grid place-items-center disabled:opacity-30"
                    aria-label="تحريك"
                  >↑</button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    className="size-7 rounded-md bg-primary/80 text-primary-foreground grid place-items-center disabled:opacity-30"
                    aria-label="تحريك"
                  >↓</button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="size-7 rounded-md bg-destructive text-destructive-foreground grid place-items-center"
                    aria-label="حذف"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                {i === 0 && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">رئيسية</span>}
              </div>
              {i === 0 && (
                <div className="absolute top-1 right-1 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">رئيسية</div>
              )}
            </div>
          ))}
          {/* Add more from library */}
          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 grid place-items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <Sparkles className="size-6" />
            <span className="text-[10px] mt-1">إضافة</span>
          </button>
        </div>
      )}

      {/* Library Picker Modal */}
      <ImageLibraryPicker
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onSelect={handleLibrarySelect}
        type={type}
        title="اختيار صور من المكتبة"
      />
    </div>
  )
}
