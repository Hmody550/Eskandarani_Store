/**
 * GET /api/library — search the image library
 * Query params:
 *   q: search term (matches filename)
 *   category: filter by category (phones, accessories, cases, audio, chargers, wearables, cameras, tablets, laptops, brands, icons, general)
 *   limit: max results (default 100)
 *
 * Returns: { images: [{ url, name, category }] }
 */
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const LIBRARY_DIR = path.join(process.cwd(), 'public', 'library')

const CATEGORIES = [
  'phones', 'tablets', 'audio', 'cases', 'accessories',
  'chargers', 'wearables', 'cameras', 'laptops', 'brands', 'icons', 'general',
  'cables', 'flash', 'stickers',
]

const CATEGORY_LABELS: Record<string, string> = {
  phones: 'هواتف ذكية',
  tablets: 'أجهزة لوحية',
  audio: 'سماعات',
  cases: 'جرابات',
  accessories: 'ملحقات',
  chargers: 'شواحن',
  wearables: 'ساعات ذكية',
  cameras: 'كاميرات',
  laptops: 'لابتوب',
  brands: 'شعارات الماركات',
  icons: 'أيقونات الفئات',
  general: 'عام',
  cables: 'كابلات',
  flash: 'فلاشات',
  stickers: 'استيكرات',
}

function scanLibrary(): Array<{ url: string; name: string; category: string; categoryLabel: string }> {
  const images: Array<{ url: string; name: string; category: string; categoryLabel: string }> = []
  for (const cat of CATEGORIES) {
    const dir = path.join(LIBRARY_DIR, cat)
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir)
    for (const file of files) {
      if (!file.match(/\.(png|jpg|jpeg|webp|svg)$/i)) continue
      const name = file.replace(/\.[^.]+$/, '')
      images.push({
        url: `/library/${cat}/${file}`,
        name: name.replace(/-/g, ' '),
        category: cat,
        categoryLabel: CATEGORY_LABELS[cat] ?? cat,
      })
    }
  }
  return images
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const query = (sp.get('q') ?? '').toLowerCase().trim()
    const category = sp.get('category') ?? 'all'
    const limit = Math.min(Number(sp.get('limit') ?? 200), 500)

    let images = scanLibrary()

    // Filter by category
    if (category !== 'all' && CATEGORIES.includes(category)) {
      images = images.filter(img => img.category === category)
    }

    // Filter by search query
    if (query) {
      images = images.filter(img =>
        img.name.toLowerCase().includes(query) ||
        img.category.toLowerCase().includes(query) ||
        img.categoryLabel.includes(query)
      )
    }

    // Limit results
    images = images.slice(0, limit)

    return NextResponse.json({
      images,
      total: images.length,
      categories: CATEGORIES.map(c => ({
        value: c,
        label: CATEGORY_LABELS[c] ?? c,
        count: scanLibrary().filter(i => i.category === c).length,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'فشل تحميل المكتبة' }, { status: 500 })
  }
}
