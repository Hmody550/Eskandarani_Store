/**
 * Product Repository — encapsulates all Prisma queries for products.
 * Repository Pattern keeps persistence details out of services.
 */
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export interface ProductListFilters {
  search?: string
  brandIds?: string[]
  categoryIds?: string[]
  minPrice?: number
  maxPrice?: number
  isFeatured?: boolean
  isBestSeller?: boolean
  isNewArrival?: boolean
  isOnSale?: boolean
  sort?: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'best-selling'
  cursor?: string
  limit?: number
}

export interface ProductListResult {
  items: ProductListItem[]
  nextCursor: string | null
  total: number
}

export interface ProductListItem {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  comparePrice: number | null
  currency: string
  rating: number
  reviewCount: number
  soldCount: number
  isFeatured: boolean
  isBestSeller: boolean
  isNewArrival: boolean
  isOnSale: boolean
  brandName: string | null
  brandSlug: string | null
  categoryName: string | null
  imageUrl: string | null
  inStock: boolean
  discountPercent: number | null
}

const includeRelations = {
  brand: true,
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
  variants: { where: { isActive: true }, select: { stock: true, reservedStock: true } },
} satisfies Prisma.ProductInclude

function toListItem(p: Prisma.ProductGetPayload<{ include: typeof includeRelations }>): ProductListItem {
  const totalStock = p.variants.reduce((s, v) => s + Math.max(0, v.stock - v.reservedStock), 0)
  const inStock = totalStock > 0
  const discount = p.comparePrice && p.comparePrice > p.price
    ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
    : null
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    comparePrice: p.comparePrice,
    currency: p.currency,
    rating: p.rating,
    reviewCount: p.reviewCount,
    soldCount: p.soldCount,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNewArrival: p.isNewArrival,
    isOnSale: p.isOnSale,
    brandName: p.brand?.name ?? null,
    brandSlug: p.brand?.slug ?? null,
    categoryName: p.category?.name ?? null,
    imageUrl: p.images[0]?.url ?? null,
    inStock,
    discountPercent: discount,
  }
}

export const productRepository = {
  async list(filters: ProductListFilters = {}): Promise<ProductListResult> {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { sku: { contains: filters.search } },
        { description: { contains: filters.search } },
        { brand: { name: { contains: filters.search } } },
      ]
    }
    if (filters.brandIds?.length) where.brandId = { in: filters.brandIds }
    if (filters.categoryIds?.length) where.categoryId = { in: filters.categoryIds }
    if (typeof filters.minPrice === 'number' || typeof filters.maxPrice === 'number') {
      where.price = {}
      if (typeof filters.minPrice === 'number') where.price.gte = filters.minPrice
      if (typeof filters.maxPrice === 'number') where.price.lte = filters.maxPrice
    }
    if (filters.isFeatured) where.isFeatured = true
    if (filters.isBestSeller) where.isBestSeller = true
    if (filters.isNewArrival) where.isNewArrival = true
    if (filters.isOnSale) where.isOnSale = true

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      filters.sort === 'price-asc' ? { price: 'asc' }
      : filters.sort === 'price-desc' ? { price: 'desc' }
      : filters.sort === 'rating' ? { rating: 'desc' }
      : filters.sort === 'newest' ? { createdAt: 'desc' }
      : filters.sort === 'best-selling' ? { soldCount: 'desc' }
      : { createdAt: 'desc' }

    const limit = Math.min(filters.limit ?? 24, 60)

    const [items, total] = await Promise.all([
      db.product.findMany({
        where,
        include: includeRelations,
        orderBy,
        take: limit + 1,
        ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
      }),
      db.product.count({ where }),
    ])

    let nextCursor: string | null = null
    if (items.length > limit) {
      items.pop()
      nextCursor = items[items.length - 1].id
    }

    return { items: items.map(toListItem), nextCursor, total }
  },

  async featured(limit = 8): Promise<ProductListItem[]> {
    const items = await db.product.findMany({
      where: { isActive: true, deletedAt: null, isFeatured: true },
      include: includeRelations,
      orderBy: { soldCount: 'desc' },
      take: limit,
    })
    return items.map(toListItem)
  },

  async bestSellers(limit = 8): Promise<ProductListItem[]> {
    const items = await db.product.findMany({
      where: { isActive: true, deletedAt: null, isBestSeller: true },
      include: includeRelations,
      orderBy: { soldCount: 'desc' },
      take: limit,
    })
    return items.map(toListItem)
  },

  async newArrivals(limit = 8): Promise<ProductListItem[]> {
    const items = await db.product.findMany({
      where: { isActive: true, deletedAt: null, isNewArrival: true },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return items.map(toListItem)
  },

  async onSale(limit = 8): Promise<ProductListItem[]> {
    const items = await db.product.findMany({
      where: { isActive: true, deletedAt: null, isOnSale: true },
      include: includeRelations,
      orderBy: { soldCount: 'desc' },
      take: limit,
    })
    return items.map(toListItem)
  },

  async bySlug(slug: string) {
    const product = await db.product.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
        reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })
    if (!product) return null
    // Bump view count async (fire-and-forget)
    db.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})
    return product
  },

  async related(productId: string, categoryId: string | null, limit = 4): Promise<ProductListItem[]> {
    const items = await db.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        id: { not: productId },
        ...(categoryId ? { categoryId } : {}),
      },
      include: includeRelations,
      orderBy: { soldCount: 'desc' },
      take: limit,
    })
    return items.map(toListItem)
  },

  async byIds(ids: string[]): Promise<ProductListItem[]> {
    const items = await db.product.findMany({
      where: { id: { in: ids }, isActive: true, deletedAt: null },
      include: includeRelations,
    })
    return items.map(toListItem)
  },
}
