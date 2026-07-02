/**
 * Generate a premium logo that matches the uploaded image's design language:
 * - Circular gold ring border
 * - Deep black background
 * - Smartphone icon with checkmark
 * - Credit card / wallet icon
 * - WiFi waves
 * - Gold + dark blue color scheme
 * But with "أسكندراني فون" branding instead of payment text
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = '/home/z/my-project/public'

async function generate(prompt: string, outputPath: string): Promise<boolean> {
  const zai = await ZAI.create()
  for (let attempt = 0; attempt < 3; attempt++) {
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
      console.log(`  ⚠️  Attempt ${attempt + 1}: ${e.message}`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  return false
}

async function main() {
  console.log('🎨 Generating premium logo (matching uploaded image style)...')

  // Generate the main logo — matches the uploaded image's design language
  const mainPrompt = `Premium luxury circular logo design for a phone store brand. 

DESIGN ELEMENTS (exactly like a high-end payment logo):
- Outer thin circular gold metallic ring border (champagne gold #D4AF37)
- Deep black background inside the circle (#0A0A0A)
- A sleek smartphone icon in the center-top area, rendered in gold metallic
- A credit card icon overlapping the phone bottom-right, in dark blue with gold stripe
- WiFi signal waves emanating from the phone in light blue
- A green/blue checkmark on the phone screen
- Dark blue decorative wave lines at the bottom of the inner circle
- Subtle gold glow effects on metallic elements
- Premium luxury aesthetic like Rolex or a 5-star hotel emblem

TEXT (most important):
- Large elegant Arabic text "أسكندراني فون" in gold metallic calligraphic font, centered in the middle of the circle
- Small subtitle "PREMIUM · EGYPT" below in white with gold decorative lines on sides

COLORS: Gold (#D4AF37), Dark Blue (#1A237E), Black (#0A0A0A), White, Light Blue (#2196F3)
STYLE: Luxury brand logo, professional, elegant, 8k quality, no artifacts, centered composition`

  // Main logo
  console.log('\n📱 Main logo:')
  await generate(mainPrompt, path.join(OUTPUT_DIR, 'logo.png'))

  // Favicon (simplified)
  console.log('\n🔷 Favicon:')
  const faviconPrompt = `Minimalist premium circular logo icon. Gold metallic ring border, deep black background, a single gold smartphone icon in center with a small dark blue credit card overlapping. No text. Luxury brand emblem style. 8k quality.`
  await generate(faviconPrompt, path.join(OUTPUT_DIR, 'favicon-new.png'))

  // Hero background logo (larger, more decorative)
  console.log('\n🌟 Hero decorative logo:')
  const heroPrompt = `Ultra premium luxury circular emblem logo. Gold metallic ornate ring border with laurel wreath details, deep black background with subtle dark blue glow. Center: an elegant gold smartphone with a dark blue credit card and gold WiFi waves. Large Arabic calligraphic text "أسكندراني فون" in gold at center. Small crown emblem at top. Premium 5-star hotel quality, 8k, professional logo design.`
  await generate(heroPrompt, path.join(OUTPUT_DIR, 'logo-hero.png'))

  console.log('\n✅ Done!')
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
