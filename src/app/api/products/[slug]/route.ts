/**
 * GET /api/products/[slug] — product detail with variants, reviews, related
 */
import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/server/services/product.service'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const product = await productService.bySlug(slug)
    if (!product) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })
    return NextResponse.json(product)
  } catch (e) {
    return NextResponse.json({ error: 'فشل تحميل المنتج' }, { status: 500 })
  }
}
