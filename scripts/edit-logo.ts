/**
 * Edit the uploaded image to become the site's logo identity.
 * Replaces "المدفوعات الإلكترونية" text with "أسكندراني فون".
 * Enhances with premium luxury touches while keeping the original design language.
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const INPUT_IMAGE = '/home/z/my-project/upload/photo_2026-07-01_04-14-08.jpg'
const OUTPUT_DIR = '/home/z/my-project/public'

// Read the original image and convert to base64 data URL
const imageBuffer = fs.readFileSync(INPUT_IMAGE)
const base64Image = imageBuffer.toString('base64')
const dataUrl = `data:image/jpeg;base64,${base64Image}`

// Premium edit prompt — transforms the payment logo into a phone store brand identity
const EDIT_PROMPT = `Transform this circular gold-rimmed logo into a premium luxury brand identity for "أسكندراني فون" (Askandarani Phone).

CRITICAL CHANGES:
1. Replace the Arabic text "المدفوعات الإلكترونية" with "أسكندراني فون" in the SAME elegant gold calligraphic Arabic font, same size and position
2. Replace the subtitle "الخدمات المصرفية والمدفوعات الرقمية" with "PREMIUM · EGYPT" in elegant smaller white text with gold decorative lines on sides
3. Keep the smartphone icon in the center-top but make it more prominent and elegant
4. Keep the credit card icon but make it smaller and more refined
5. Keep the WiFi waves but make them gold instead of blue for luxury consistency
6. Add a small crown emblem at the very top of the circle for royal premium feel

PRESERVE EXACTLY:
- The circular gold ring border (same thickness, same metallic gold color #D4AF37)
- The deep black background inside the circle (#0A0A0A)
- The dark blue wave lines at the bottom of the inner circle
- The overall circular composition and size
- The premium luxury aesthetic with gold + dark blue + black color scheme
- The metallic shine effects on the gold elements

ENHANCE:
- Make the gold elements slightly more luminous and metallic
- Add subtle gold sparkle stars in the corners
- Ensure the Arabic text "أسكندراني فون" is beautifully rendered, centered, and prominent
- The overall feel should be: luxury jewelry brand, 5-star hotel, Rolex-level premium

Output: 1024x1024, ultra high quality, professional logo design, no artifacts`

async function main() {
  console.log('🎨 Initializing Z-AI SDK...')
  const zai = await ZAI.create()

  console.log('📸 Original image size:', (imageBuffer.length / 1024).toFixed(0), 'KB')
  console.log('✨ Editing image with premium prompt...')
  console.log('')

  // Generate 3 variations to choose the best
  const variations = [
    {
      name: 'logo-premium-v1',
      prompt: EDIT_PROMPT,
    },
    {
      name: 'logo-premium-v2',
      prompt: `${EDIT_PROMPT}\n\nVARIATION 2: Make the gold brighter and more champagne-colored, add a subtle royal blue glow behind the phone icon, make the Arabic text larger and more ornate.`,
    },
    {
      name: 'logo-premium-v3',
      prompt: `${EDIT_PROMPT}\n\nVARIATION 3: Add laurel wreath branches on the left and right sides of the inner circle (gold), add a "PREMIUM" ribbon banner at the very bottom, make it look like a luxury award medal.`,
    },
  ]

  const results = []

  for (const v of variations) {
    const outputPath = path.join(OUTPUT_DIR, `${v.name}.png`)
    console.log(`  Generating ${v.name}...`)

    let success = false
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await zai.images.generations.edit({
          prompt: v.prompt,
          images: [{ url: dataUrl }],
          size: '1024x1024' as const,
        })

        const imageBase64 = response.data?.[0]?.base64
        if (!imageBase64) throw new Error('No base64 in response')

        const buffer = Buffer.from(imageBase64, 'base64')
        fs.writeFileSync(outputPath, buffer)
        console.log(`  ✓ ${v.name}.png (${(buffer.length / 1024).toFixed(0)} KB)`)
        results.push({ name: v.name, path: outputPath, size: buffer.length })
        success = true
        break
      } catch (e: any) {
        console.log(`  ⚠️  Attempt ${attempt + 1} failed: ${e.message}`)
        if (attempt === 1) {
          console.log(`  ✗ ${v.name} failed`)
        }
        await new Promise(r => setTimeout(r, 2000))
      }
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log('')
  console.log(`✅ Generated ${results.length} variations:`)
  results.forEach(r => console.log(`   - /public/${r.name}.png`))
}

main().catch(e => {
  console.error('Fatal:', e)
  process.exit(1)
})
