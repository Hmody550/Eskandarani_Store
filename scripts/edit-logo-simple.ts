/**
 * Edit the uploaded image — simple, clean prompt to avoid content filter.
 * Just replace text and enhance luxury feel.
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const INPUT_IMAGE = '/home/z/my-project/upload/photo_2026-07-01_04-14-08.jpg'
const OUTPUT_DIR = '/home/z/my-project/public'

const imageBuffer = fs.readFileSync(INPUT_IMAGE)
const base64Image = imageBuffer.toString('base64')
const dataUrl = `data:image/jpeg;base64,${base64Image}`

async function main() {
  console.log('🎨 Initializing Z-AI SDK...')
  const zai = await ZAI.create()
  console.log('📸 Original image:', (imageBuffer.length / 1024).toFixed(0), 'KB')

  // Simple, clean prompt — just text replacement
  const prompt = 'Replace the Arabic text in this circular gold logo with "أسكندراني فون" in elegant gold calligraphic Arabic font. Keep the smartphone, credit card, WiFi waves, gold ring border, and dark background exactly the same. Make it look like a premium luxury brand logo. High quality, professional.'

  const outputPath = path.join(OUTPUT_DIR, 'logo-edited.png')
  console.log('✨ Editing image...')

  try {
    const response = await zai.images.generations.edit({
      prompt,
      images: [{ url: dataUrl }],
      size: '1024x1024' as const,
    })

    const imageBase64 = response.data?.[0]?.base64
    if (!imageBase64) throw new Error('No base64 in response')

    const buffer = Buffer.from(imageBase64, 'base64')
    fs.writeFileSync(outputPath, buffer)
    console.log(`✅ Saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)} KB)`)
  } catch (e: any) {
    console.error('✗ Error:', e.message)
    process.exit(1)
  }
}

main()
