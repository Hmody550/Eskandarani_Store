/**
 * GET /api/catalog/home — Home page aggregate
 */
import { NextResponse } from 'next/server'
import { productService } from '@/server/services/product.service'

export async function GET() {
  try {
    const [categories, brands, featured, bestSellers, newArrivals, onSale] = await Promise.all([
      productService.categories(),
      productService.brands(),
      productService.featured(),
      productService.bestSellers(),
      productService.newArrivals(),
      productService.onSale(),
    ])
    return NextResponse.json({ categories, brands, featured, bestSellers, newArrivals, onSale })
  } catch (e) {
    return NextResponse.json({ error: 'فشل تحميل البيانات' }, { status: 500 })
  }
}
