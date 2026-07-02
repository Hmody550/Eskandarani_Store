/**
 * Resume image generation — only generate missing images.
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = '/home/z/my-project/public/products'
const BRAND_DIR = '/home/z/my-project/public/brands'
const CATEGORY_DIR = '/home/z/my-project/public/categories'

const PRODUCTS = [
  { name: 'infinix-note-40-pro', prompt: 'Professional product photography of Infinix Note 40 Pro in black, standing upright, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'ipad-air-5', prompt: 'Professional product photography of iPad Air 5 in space gray, leaning at angle, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'ipad-10', prompt: 'Professional product photography of iPad 10 in blue, leaning at angle, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'galaxy-tab-s9', prompt: 'Professional product photography of Samsung Galaxy Tab S9 in gray, leaning at angle, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'xiaomi-pad-6', prompt: 'Professional product photography of Xiaomi Pad 6 in black, leaning at angle, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'airpods-pro-2', prompt: 'Professional product photography of Apple AirPods Pro 2 case open with earbuds visible, dark navy gradient background, dramatic studio lighting, golden rim light, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'airpods-3', prompt: 'Professional product photography of Apple AirPods 3 case open, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'galaxy-buds3-pro', prompt: 'Professional product photography of Samsung Galaxy Buds3 Pro case open, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'redmi-buds-5-pro', prompt: 'Professional product photography of Redmi Buds 5 Pro case open, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'magsafe-charger', prompt: 'Professional product photography of Apple MagSafe Charger pad, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'samsung-25w-charger', prompt: 'Professional product photography of Samsung 25W USB-C charger, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'anker-powerwave', prompt: 'Professional product photography of Anker PowerWave wireless charger pad, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'iphone-15-case', prompt: 'Professional product photography of clear iPhone 15 phone case, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'galaxy-s24-cover', prompt: 'Professional product photography of Samsung Galaxy S24 silicone cover in black, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'apple-watch-9', prompt: 'Professional product photography of Apple Watch Series 9 in midnight aluminum, dark navy gradient background, dramatic studio lighting, golden rim light, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'galaxy-watch6', prompt: 'Professional product photography of Samsung Galaxy Watch6 in gray, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'xiaomi-watch-s3', prompt: 'Professional product photography of Xiaomi Watch S3 in black, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'canon-eos-r50', prompt: 'Professional product photography of Canon EOS R50 camera in black with kit lens, dark navy gradient background, dramatic studio lighting, golden rim light, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
]

const BRANDS = [
  { name: 'apple', prompt: 'Minimalist premium logo for Apple brand, just a stylized apple silhouette in gold gradient, dark navy background, ultra clean, 8k, no text' },
  { name: 'samsung', prompt: 'Minimalist premium logo for Samsung, stylized Samsung wordmark in gold gradient on dark navy background, ultra clean, 8k' },
  { name: 'xiaomi', prompt: 'Minimalist premium logo for Xiaomi brand, stylized Mi logo in gold gradient on dark navy background, ultra clean, 8k' },
  { name: 'oppo', prompt: 'Minimalist premium logo for Oppo brand, stylized OPPO wordmark in gold gradient on dark navy background, ultra clean, 8k' },
  { name: 'realme', prompt: 'Minimalist premium logo for Realme brand, stylized realme wordmark in gold gradient on dark navy background, ultra clean, 8k' },
  { name: 'honor', prompt: 'Minimalist premium logo for Honor brand, stylized HONOR wordmark in gold gradient on dark navy background, ultra clean, 8k' },
  { name: 'nothing', prompt: 'Minimalist premium logo for Nothing brand, stylized dot matrix pattern in gold on dark navy background, ultra clean, 8k' },
  { name: 'infinix', prompt: 'Minimalist premium logo for Infinix brand, stylized Infinix wordmark in gold gradient on dark navy background, ultra clean, 8k' },
]

const CATEGORIES = [
  { name: 'smartphones', prompt: 'Premium icon-style image of modern smartphone with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'tablets', prompt: 'Premium icon-style image of modern tablet with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'audio', prompt: 'Premium icon-style image of wireless earbuds with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'accessories', prompt: 'Premium icon-style image of phone case with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'chargers', prompt: 'Premium icon-style image of phone charger with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'wearables', prompt: 'Premium icon-style image of smartwatch with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'cameras', prompt: 'Premium icon-style image of camera with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'laptops', prompt: 'Premium icon-style image of laptop with gold accents on dark navy background, ultra clean minimalist, 8k' },
]

async function generateOne(zai: any, prompt: string, outputPath: string, retries = 3): Promise<boolean> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await zai.images.generations.create({
        prompt,
        size: '1024x1024' as const,
      })
      const base64 = response.data?.[0]?.base64
      if (!base64) throw new Error('No base64')
      const buffer = Buffer.from(base64, 'base64')
      fs.writeFileSync(outputPath, buffer)
      console.log(`  ✓ ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(0)} KB)`)
      return true
    } catch (e: any) {
      if (attempt < retries) {
        console.log(`  ⚠️  Retry ${attempt + 1} for ${path.basename(outputPath)}: ${e.message}`)
        await new Promise(r => setTimeout(r, 2000))
      } else {
        console.error(`  ✗ ${path.basename(outputPath)}: ${e.message}`)
        return false
      }
    }
  }
  return false
}

async function main() {
  console.log('🎨 Initializing Z-AI SDK...')
  const zai = await ZAI.create()

  // Products
  console.log(`\n📱 Generating remaining products...`)
  let pCount = 0
  for (const item of PRODUCTS) {
    const outPath = path.join(OUTPUT_DIR, `${item.name}.png`)
    if (fs.existsSync(outPath)) {
      console.log(`  ⊙ ${item.name}.png (cached)`)
      pCount++
      continue
    }
    const ok = await generateOne(zai, item.prompt, outPath)
    if (ok) pCount++
    await new Promise(r => setTimeout(r, 500))
  }
  console.log(`  Products done: ${pCount}/${PRODUCTS.length}`)

  // Brands
  console.log(`\n🏷️  Generating brand logos...`)
  let bCount = 0
  for (const item of BRANDS) {
    const outPath = path.join(BRAND_DIR, `${item.name}.png`)
    if (fs.existsSync(outPath)) {
      console.log(`  ⊙ ${item.name}.png (cached)`)
      bCount++
      continue
    }
    const ok = await generateOne(zai, item.prompt, outPath)
    if (ok) bCount++
    await new Promise(r => setTimeout(r, 500))
  }
  console.log(`  Brands done: ${bCount}/${BRANDS.length}`)

  // Categories
  console.log(`\n📂 Generating category icons...`)
  let cCount = 0
  for (const item of CATEGORIES) {
    const outPath = path.join(CATEGORY_DIR, `${item.name}.png`)
    if (fs.existsSync(outPath)) {
      console.log(`  ⊙ ${item.name}.png (cached)`)
      cCount++
      continue
    }
    const ok = await generateOne(zai, item.prompt, outPath)
    if (ok) cCount++
    await new Promise(r => setTimeout(r, 500))
  }
  console.log(`  Categories done: ${cCount}/${CATEGORIES.length}`)

  console.log(`\n✅ Done!`)
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
