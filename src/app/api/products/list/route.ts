/**
 * GET /api/products/list — paginated, filtered, sorted product list
 */
import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/server/services/product.service'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const filters = {
      search: sp.get('search') ?? undefined,
      brandIds: sp.get('brandIds') ? sp.get('brandIds')!.split(',') : undefined,
      categoryIds: sp.get('categoryIds') ? sp.get('categoryIds')!.split(',') : undefined,
      minPrice: sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined,
      maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
      isFeatured: sp.get('isFeatured') === 'true',
      isBestSeller: sp.get('isBestSeller') === 'true',
      isNewArrival: sp.get('isNewArrival') === 'true',
      isOnSale: sp.get('isOnSale') === 'true',
      sort: (sp.get('sort') as any) ?? undefined,
      cursor: sp.get('cursor') ?? undefined,
      limit: sp.get('limit') ? Number(sp.get('limit')) : undefined,
    }
    const result = await productService.list(filters)
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: 'فشل تحميل المنتجات' }, { status: 500 })
  }
}
