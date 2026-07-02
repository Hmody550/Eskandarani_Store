/**
 * BrandsManager — CRUD UI for brands.
 */
'use client'

import { useState } from 'react'
import { useAdminBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/shared/hooks/admin-queries'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Loader2, Tag, Globe, Save, X } from 'lucide-react'
import { ImageUpload } from './image-upload'

export function BrandsManager() {
  const { data, isLoading } = useAdminBrands()
  const createMutation = useCreateBrand()
  const updateMutation = useUpdateBrand()
  const deleteMutation = useDeleteBrand()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', logoUrl: '', country: '', isActive: true,
  })

  const handleCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', logoUrl: '', country: '', isActive: true })
    setShowForm(true)
  }
  const handleEdit = (b: any) => {
    setEditing(b)
    setForm({
      name: b.name, slug: b.slug, description: b.description ?? '',
      logoUrl: b.logoUrl ?? '', country: b.country ?? '', isActive: b.isActive,
    })
    setShowForm(true)
  }
  const handleSave = async () => {
    if (!form.name) return
    const payload = { ...form, slug: form.slug || undefined }
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
          <Tag className="size-5 text-primary" /> الماركات ({data?.brands.length ?? 0})
        </h3>
        <Button onClick={handleCreate} className="gap-2 shadow-glow">
          <Plus className="size-4" /> إضافة ماركة
        </Button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-12"><Loader2 className="size-6 animate-spin text-primary" /></div>
      ) : (data?.brands.length ?? 0) === 0 ? (
        <Card className="p-12 text-center">
          <Tag className="size-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">لا توجد ماركات بعد</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data?.brands.map((b: any) => (
            <Card key={b.id} className="p-4 group hover:shadow-soft transition-shadow">
              <div className="flex items-start gap-3">
                <div className="size-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                  {b.logoUrl ? (
                    <img src={b.logoUrl} alt={b.name} className="size-full object-cover" loading="lazy" />
                  ) : (
                    <div className="size-full grid place-items-center font-bold text-2xl gradient-text">{b.name[0]}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{b.name}</div>
                  {b.country && <div className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="size-3" />{b.country}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{b._count?.products ?? 0} منتج</div>
                  <div className="mt-1">
                    {b.isActive ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success">نشط</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">موقوف</span>
                    )}
                  </div>
                </div>
              </div>
              {b.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{b.description}</p>
              )}
              <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleEdit(b)}>
                  <Pencil className="size-3.5" /> تعديل
                </Button>
                <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(b.id)} aria-label="حذف">
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
            <DialogTitle>{editing ? 'تعديل ماركة' : 'إضافة ماركة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="w-32 shrink-0">
                <ImageUpload type="brands" value={form.logoUrl || null} onChange={(url) => setForm({ ...form, logoUrl: url ?? '' })} label="الشعار" />
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
                  <Label className="text-xs">الدولة</Label>
                  <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="mt-1" placeholder="China, USA..." />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs">الوصف</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 resize-none" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: !!c })} />
              نشط (يظهر في المتجر)
            </label>
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
            <AlertDialogTitle>حذف الماركة</AlertDialogTitle>
            <AlertDialogDescription>سيتم فصل المنتجات المرتبطة بها. هل تريد المتابعة؟</AlertDialogDescription>
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

function slugify(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}
