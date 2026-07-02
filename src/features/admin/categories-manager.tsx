/**
 * CategoriesManager — CRUD UI for categories.
 */
'use client'

import { useState } from 'react'
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/shared/hooks/admin-queries'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Loader2, FolderTree, Save, X, ArrowLeft } from 'lucide-react'
import { ImageUpload } from './image-upload'
import { useUIStore } from '@/shared/stores/ui.store'

const ICON_OPTIONS = [
  'Smartphone', 'Tablet', 'Headphones', 'Cable', 'BatteryCharging',
  'Watch', 'Camera', 'Laptop', 'Monitor', 'Keyboard', 'Mouse',
  'Gamepad2', 'Tv', 'Printer', 'MemoryStick',
]

export function CategoriesManager() {
  const { data, isLoading } = useAdminCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', imageUrl: '', icon: 'Smartphone',
    parentId: '', isActive: true, sortOrder: 0,
  })

  const handleCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', imageUrl: '', icon: 'Smartphone', parentId: '', isActive: true, sortOrder: 0 })
    setShowForm(true)
  }
  const handleEdit = (c: any) => {
    setEditing(c)
    setForm({
      name: c.name, slug: c.slug, description: c.description ?? '',
      imageUrl: c.imageUrl ?? '', icon: c.icon ?? 'Smartphone',
      parentId: c.parentId ?? '', isActive: c.isActive, sortOrder: c.sortOrder ?? 0,
    })
    setShowForm(true)
  }
  const handleSave = async () => {
    if (!form.name) return
    const payload = { ...form, slug: form.slug || undefined, parentId: form.parentId || null }
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, ...payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    setShowForm(false)
  }
  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <FolderTree className="size-5 text-primary" /> الفئات ({data?.categories.length ?? 0})
        </h3>
        <Button onClick={handleCreate} className="gap-2 shadow-glow">
          <Plus className="size-4" /> إضافة فئة
        </Button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-12"><Loader2 className="size-6 animate-spin text-primary" /></div>
      ) : (data?.categories.length ?? 0) === 0 ? (
        <Card className="p-12 text-center">
          <FolderTree className="size-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">لا توجد فئات بعد</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data?.categories.map((c: any) => (
            <Card key={c.id} className="p-4 group hover:shadow-soft transition-shadow">
              <div className="flex items-start gap-3">
                <div className="size-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="size-full object-cover" loading="lazy" />
                  ) : (
                    <div className="size-full grid place-items-center">
                      <CategoryIcon name={c.icon} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold flex items-center gap-1.5">
                    {c.name}
                    {c.parent && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><ArrowLeft className="size-3" />{c.parent.name}</span>}
                  </div>
                  {c.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>}
                  <div className="text-xs text-muted-foreground mt-1">{c._count?.products ?? 0} منتج · ترتيب: {c.sortOrder}</div>
                  <div className="mt-1">
                    {c.isActive ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success">نشط</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">موقوف</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleEdit(c)}>
                  <Pencil className="size-3.5" /> تعديل
                </Button>
                <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(c.id)} aria-label="حذف">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل فئة' : 'إضافة فئة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="w-32 shrink-0">
                <ImageUpload type="categories" value={form.imageUrl || null} onChange={(url) => setForm({ ...form, imageUrl: url ?? '' })} label="الصورة" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-xs">الاسم *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">الـ Slug</Label>
                  <Input value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} dir="ltr" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">الفئة الأب (اختياري)</Label>
                  <Select value={form.parentId || 'none'} onValueChange={(v) => setForm({ ...form, parentId: v === 'none' ? '' : v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="بدون (فئة رئيسية)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون (فئة رئيسية)</SelectItem>
                      {data?.categories.filter((c: any) => c.id !== editing?.id).map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs">الأيقونة (تظهر بدلاً من الصورة إذا لم تُرفع)</Label>
              <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">الوصف</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">الترتيب</Label>
                <Input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} className="mt-1" />
              </div>
              <label className="flex items-center gap-2 text-sm self-end pb-3">
                <Checkbox checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: !!c })} />
                نشط
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} className="gap-1"><X className="size-4" /> إلغاء</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="gap-1">
              {createMutation.isPending || updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الفئة</AlertDialogTitle>
            <AlertDialogDescription>سيتم فصل المنتجات والفئات الفرعية المرتبطة. متابعة؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CategoryIcon({ name }: { name: string | null }) {
  // Use lucide-react via dynamic approach — we keep it simple by using a small map
  const icons: Record<string, string> = {
    Smartphone: '📱', Tablet: '📋', Headphones: '🎧', Cable: '🔌',
    BatteryCharging: '⚡', Watch: '⌚', Camera: '📷', Laptop: '💻',
    Monitor: '🖥️', Keyboard: '⌨️', Mouse: '🖱️', Gamepad2: '🎮',
    Tv: '📺', Printer: '🖨️', MemoryStick: '💾',
  }
  return <span className="text-3xl">{icons[name ?? 'Smartphone'] ?? '📦'}</span>
}

function slugify(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}
