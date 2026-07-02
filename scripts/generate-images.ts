/**
 * Generate professional product images using Z-AI image generation.
 * Saves to /public/products/ as PNG files.
 * Designed for premium product photography look.
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = '/home/z/my-project/public/products'
const BRAND_DIR = '/home/z/my-project/public/brands'
const CATEGORY_DIR = '/home/z/my-project/public/categories'

;[OUTPUT_DIR, BRAND_DIR, CATEGORY_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
})

// Product image prompts — premium e-commerce photography style
const PRODUCT_PROMPTS = [
  { name: 'iphone-15-pro-max', prompt: 'Professional product photography of iPhone 15 Pro Max in titanium natural color, standing upright, dark navy gradient background, dramatic studio lighting, golden rim light, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'iphone-15', prompt: 'Professional product photography of iPhone 15 in black, standing upright, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'iphone-14', prompt: 'Professional product photography of iPhone 14 in midnight blue, standing upright, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'galaxy-s24-ultra', prompt: 'Professional product photography of Samsung Galaxy S24 Ultra in titanium black, standing upright, dark navy gradient background, dramatic studio lighting, golden rim light, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'galaxy-s24', prompt: 'Professional product photography of Samsung Galaxy S24 in violet, standing upright, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'galaxy-a55', prompt: 'Professional product photography of Samsung Galaxy A55 in dark blue, standing upright, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'galaxy-a15', prompt: 'Professional product photography of Samsung Galaxy A15 in black, standing upright, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'xiaomi-14-pro', prompt: 'Professional product photography of Xiaomi 14 Pro in black, standing upright, dark navy gradient background, dramatic studio lighting, golden rim light, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'redmi-note-13-pro', prompt: 'Professional product photography of Xiaomi Redmi Note 13 Pro in purple, standing upright, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'redmi-13c', prompt: 'Professional product photography of Xiaomi Redmi 13C in black, standing upright, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'oppo-reno-11-pro', prompt: 'Professional product photography of Oppo Reno 11 Pro in green, standing upright, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'oppo-a79', prompt: 'Professional product photography of Oppo A79 in black, standing upright, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'realme-12-pro-plus', prompt: 'Professional product photography of Realme 12 Pro+ in blue, standing upright, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'realme-c67', prompt: 'Professional product photography of Realme C67 in green, standing upright, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'honor-magic6-pro', prompt: 'Professional product photography of Honor Magic6 Pro in black, standing upright, dark navy gradient background, dramatic studio lighting, golden rim light, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'honor-x9b', prompt: 'Professional product photography of Honor X9b in black, standing upright, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'nothing-phone-2', prompt: 'Professional product photography of Nothing Phone 2 in white with transparent back design, standing upright, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'infinix-note-40-pro', prompt: 'Professional product photography of Infinix Note 40 Pro in black, standing upright, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  // Tablets
  { name: 'ipad-air-5', prompt: 'Professional product photography of iPad Air 5 in space gray, leaning at angle, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'ipad-10', prompt: 'Professional product photography of iPad 10 in blue, leaning at angle, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'galaxy-tab-s9', prompt: 'Professional product photography of Samsung Galaxy Tab S9 in gray, leaning at angle, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'xiaomi-pad-6', prompt: 'Professional product photography of Xiaomi Pad 6 in black, leaning at angle, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  // Audio
  { name: 'airpods-pro-2', prompt: 'Professional product photography of Apple AirPods Pro 2 case open with earbuds visible, dark navy gradient background, dramatic studio lighting, golden rim light, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'airpods-3', prompt: 'Professional product photography of Apple AirPods 3 case open, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'galaxy-buds3-pro', prompt: 'Professional product photography of Samsung Galaxy Buds3 Pro case open, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'redmi-buds-5-pro', prompt: 'Professional product photography of Redmi Buds 5 Pro case open, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  // Chargers
  { name: 'magsafe-charger', prompt: 'Professional product photography of Apple MagSafe Charger pad, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'samsung-25w-charger', prompt: 'Professional product photography of Samsung 25W USB-C charger, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'anker-powerwave', prompt: 'Professional product photography of Anker PowerWave wireless charger pad, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  // Accessories
  { name: 'iphone-15-case', prompt: 'Professional product photography of clear iPhone 15 phone case, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  { name: 'galaxy-s24-cover', prompt: 'Professional product photography of Samsung Galaxy S24 silicone cover in black, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  // Wearables
  { name: 'apple-watch-9', prompt: 'Professional product photography of Apple Watch Series 9 in midnight aluminum, dark navy gradient background, dramatic studio lighting, golden rim light, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'galaxy-watch6', prompt: 'Professional product photography of Samsung Galaxy Watch6 in gray, dark navy gradient background, dramatic studio lighting, golden accents, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
  { name: 'xiaomi-watch-s3', prompt: 'Professional product photography of Xiaomi Watch S3 in black, dark navy gradient background, studio lighting, golden accents, ultra detailed, premium feel, 8k quality, no text, no logos' },
  // Camera
  { name: 'canon-eos-r50', prompt: 'Professional product photography of Canon EOS R50 camera in black with kit lens, dark navy gradient background, dramatic studio lighting, golden rim light, ultra detailed, premium luxury feel, 8k quality, no text, no logos' },
]

const BRAND_PROMPTS = [
  { name: 'apple', prompt: 'Minimalist premium logo for Apple brand, just a stylized apple silhouette in gold gradient, dark navy background, ultra clean, 8k, no text' },
  { name: 'samsung', prompt: 'Minimalist premium logo for Samsung, stylized Samsung wordmark in gold gradient on dark navy background, ultra clean, 8k' },
  { name: 'xiaomi', prompt: 'Minimalist premium logo for Xiaomi brand, stylized Mi logo in gold gradient on dark navy background, ultra clean, 8k' },
  { name: 'oppo', prompt: 'Minimalist premium logo for Oppo brand, stylized OPPO wordmark in gold gradient on dark navy background, ultra clean, 8k' },
  { name: 'realme', prompt: 'Minimalist premium logo for Realme brand, stylized realme wordmark in gold gradient on dark navy background, ultra clean, 8k' },
  { name: 'honor', prompt: 'Minimalist premium logo for Honor brand, stylized HONOR wordmark in gold gradient on dark navy background, ultra clean, 8k' },
  { name: 'nothing', prompt: 'Minimalist premium logo for Nothing brand, stylized dot matrix pattern in gold on dark navy background, ultra clean, 8k' },
  { name: 'infinix', prompt: 'Minimalist premium logo for Infinix brand, stylized Infinix wordmark in gold gradient on dark navy background, ultra clean, 8k' },
]

const CATEGORY_PROMPTS = [
  { name: 'smartphones', prompt: 'Premium icon-style image of modern smartphone with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'tablets', prompt: 'Premium icon-style image of modern tablet with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'audio', prompt: 'Premium icon-style image of wireless earbuds with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'accessories', prompt: 'Premium icon-style image of phone case with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'chargers', prompt: 'Premium icon-style image of phone charger with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'wearables', prompt: 'Premium icon-style image of smartwatch with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'cameras', prompt: 'Premium icon-style image of camera with gold accents on dark navy background, ultra clean minimalist, 8k' },
  { name: 'laptops', prompt: 'Premium icon-style image of laptop with gold accents on dark navy background, ultra clean minimalist, 8k' },
]

async function generateOne(zai: any, prompt: string, outputPath: string, retries = 2): Promise<boolean> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await zai.images.generations.create({
        prompt,
        size: '1024x1024' as const,
      })
      const base64 = response.data?.[0]?.base64
      if (!base64) throw new Error('No base64 in response')
      const buffer = Buffer.from(base64, 'base64')
      fs.writeFileSync(outputPath, buffer)
      console.log(`  ✓ ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(0)} KB)`)
      return true
    } catch (e: any) {
      if (attempt < retries) {
        console.log(`  ⚠️  Retry ${attempt + 1} for ${path.basename(outputPath)}...`)
        await new Promise(r => setTimeout(r, 1500))
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

  // Generate product images
  console.log(`\n📱 Generating ${PRODUCT_PROMPTS.length} product images...`)
  let productSuccess = 0
  for (const item of PRODUCT_PROMPTS) {
    const outPath = path.join(OUTPUT_DIR, `${item.name}.png`)
    if (fs.existsSync(outPath)) {
      console.log(`  ⊙ ${item.name}.png (cached)`)
      productSuccess++
      continue
    }
    const ok = await generateOne(zai, item.prompt, outPath)
    if (ok) productSuccess++
    await new Promise(r => setTimeout(r, 800)) // Be polite to API
  }

  // Generate brand images
  console.log(`\n🏷️  Generating ${BRAND_PROMPTS.length} brand images...`)
  let brandSuccess = 0
  for (const item of BRAND_PROMPTS) {
    const outPath = path.join(BRAND_DIR, `${item.name}.png`)
    if (fs.existsSync(outPath)) {
      console.log(`  ⊙ ${item.name}.png (cached)`)
      brandSuccess++
      continue
    }
    const ok = await generateOne(zai, item.prompt, outPath)
    if (ok) brandSuccess++
    await new Promise(r => setTimeout(r, 800))
  }

  // Generate category images
  console.log(`\n📂 Generating ${CATEGORY_PROMPTS.length} category images...`)
  let catSuccess = 0
  for (const item of CATEGORY_PROMPTS) {
    const outPath = path.join(CATEGORY_DIR, `${item.name}.png`)
    if (fs.existsSync(outPath)) {
      console.log(`  ⊙ ${item.name}.png (cached)`)
      catSuccess++
      continue
    }
    const ok = await generateOne(zai, item.prompt, outPath)
    if (ok) catSuccess++
    await new Promise(r => setTimeout(r, 800))
  }

  console.log(`\n✅ Done!`)
  console.log(`   Products: ${productSuccess}/${PRODUCT_PROMPTS.length}`)
  console.log(`   Brands: ${brandSuccess}/${BRAND_PROMPTS.length}`)
  console.log(`   Categories: ${catSuccess}/${CATEGORY_PROMPTS.length}`)
}

main().catch(e => {
  console.error('Fatal:', e)
  process.exit(1)
})
