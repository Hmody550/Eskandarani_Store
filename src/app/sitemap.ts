/**
 * Sitemap — dynamic from catalog
 */
import { db } from '@/lib/db'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://askandarani.phone'
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/#products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/#about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/#contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const products = await db.product.findMany({
    where: { isActive: true, deletedAt: null },
    select: { slug: true, updatedAt: true },
    take: 1000,
  })
  const productRoutes: MetadataRoute.Sitemap = products.map(p => ({
    url: `${baseUrl}/?product=${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  })
  const categoryRoutes: MetadataRoute.Sitemap = categories.map(c => ({
    url: `${baseUrl}/?category=${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
