/**
 * Generate library images batch 2: wired audio, cables, flash drives, stickers
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const LIBRARY = '/home/z/my-project/public/library'

const ITEMS = [
  // Wired earphones / headsets (سماعات سلكية)
  { cat: 'audio', name: 'earphones-wired-white', prompt: 'Professional product photography of white wired earphones with 3.5mm jack, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'earphones-wired-black', prompt: 'Professional product photography of black wired earphones with 3.5mm jack, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'headset-gaming-rgb', prompt: 'Professional product photography of gaming headset with RGB lighting, over-ear, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'headphones-studio-black', prompt: 'Professional product photography of studio headphones over-ear black, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury, 8k, no text, no logos' },
  { cat: 'audio', name: 'earphones-type-c', prompt: 'Professional product photography of USB-C wired earphones, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'earphones-lightning', prompt: 'Professional product photography of Lightning wired earphones white, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },

  // Cables (كابلات شحن)
  { cat: 'cables', name: 'cable-lightning-white', prompt: 'Professional product photography of white Lightning charging cable coiled neatly, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'cables', name: 'cable-lightning-braided', prompt: 'Professional product photography of braided Lightning charging cable, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury, 8k, no text, no logos' },
  { cat: 'cables', name: 'cable-type-c-white', prompt: 'Professional product photography of white USB-C charging cable coiled neatly, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'cables', name: 'cable-type-c-braided', prompt: 'Professional product photography of braided USB-C to USB-C cable, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'cables', name: 'cable-micro-usb', prompt: 'Professional product photography of black Micro-USB charging cable, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'cables', name: 'cable-type-c-to-lightning', prompt: 'Professional product photography of USB-C to Lightning cable white, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'cables', name: 'cable-aux', prompt: 'Professional product photography of gold-plated AUX audio cable 3.5mm, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury, 8k, no text, no logos' },
  { cat: 'cables', name: 'cable-hdmi', prompt: 'Professional product photography of HDMI cable coiled, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },

  // Flash drives (فلاشات)
  { cat: 'flash', name: 'flash-usb-32gb', prompt: 'Professional product photography of silver USB flash drive 32GB, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'flash', name: 'flash-usb-64gb', prompt: 'Professional product photography of black USB flash drive 64GB, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'flash', name: 'flash-type-c', prompt: 'Professional product photography of USB-C flash drive metal, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury, 8k, no text, no logos' },
  { cat: 'flash', name: 'flash-lightning-iphone', prompt: 'Professional product photography of Lightning flash drive for iPhone, white, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'flash', name: 'flash-otg', prompt: 'Professional product photography of OTG flash drive dual USB-C and USB-A, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'flash', name: 'flash-128gb-gold', prompt: 'Professional product photography of gold USB flash drive 128GB luxury, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury, 8k, no text, no logos' },

  // Stickers (استيكرات)
  { cat: 'stickers', name: 'sticker-privacy-camera', prompt: 'Professional product photography of camera privacy sticker slider for laptop phone, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'stickers', name: 'sticker-pack-gold', prompt: 'Professional product photography of decorative gold sticker pack for phone laptop, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury, 8k, no text, no logos' },
  { cat: 'stickers', name: 'sticker-tempered-glass', prompt: 'Professional product photography of tempered glass screen protector sticker for phone, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'stickers', name: 'sticker-skin-phone', prompt: 'Professional product photography of phone skin sticker vinyl wrap, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'stickers', name: 'sticker-decorative-set', prompt: 'Professional product photography of decorative sticker set for laptop, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'stickers', name: 'sticker-privacy-set', prompt: 'Professional product photography of privacy sticker set for camera and microphone, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
]

async function main() {
  console.log('🎨 Generating batch 2: wired audio + cables + flash + stickers...')
  const zai = await ZAI.create()
  let generated = 0, failed = 0

  for (const item of ITEMS) {
    const outPath = path.join(LIBRARY, item.cat, `${item.name}.png`)
    if (fs.existsSync(outPath)) { console.log(`  ⊙ ${item.name}`); continue }
    if (!fs.existsSync(path.join(LIBRARY, item.cat))) fs.mkdirSync(path.join(LIBRARY, item.cat), { recursive: true })

    let ok = false
    for (let i = 0; i < 2; i++) {
      try {
        const res = await zai.images.generations.create({ prompt: item.prompt, size: '1024x1024' as const })
        if (res.data?.[0]?.base64) {
          fs.writeFileSync(outPath, Buffer.from(res.data[0].base64, 'base64'))
          console.log(`  ✓ ${item.name}`)
          ok = true; generated++; break
        }
      } catch (e: any) {
        if (i === 0) await new Promise(r => setTimeout(r, 2000))
      }
    }
    if (!ok) { console.log(`  ✗ ${item.name}`); failed++ }
    await new Promise(r => setTimeout(r, 800))
  }
  console.log(`\n✅ Generated: ${generated}, Failed: ${failed}`)
  console.log(`Total library: ${countFiles(LIBRARY)}`)
}

function countFiles(dir: string): number {
  let count = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) count += countFiles(full)
    else if (entry.name.endsWith('.png')) count++
  }
  return count
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
