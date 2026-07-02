/**
 * Generate additional library images for accessories, cases, chargers, etc.
 * Creates a comprehensive image library for the admin picker.
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const LIBRARY = '/home/z/my-project/public/library'

const ITEMS = [
  // Cases (جرابات)
  { cat: 'cases', name: 'case-clear-generic', prompt: 'Professional product photography of clear transparent phone case on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'cases', name: 'case-silicone-black', prompt: 'Professional product photography of black silicone phone case on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'cases', name: 'case-leather-brown', prompt: 'Professional product photography of brown leather phone wallet case on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury feel, 8k, no text, no logos' },
  { cat: 'cases', name: 'case-rugged-black', prompt: 'Professional product photography of rugged black phone case on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'cases', name: 'case-purple', prompt: 'Professional product photography of purple phone case on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'cases', name: 'case-blue', prompt: 'Professional product photography of blue phone case on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },

  // Accessories (ملحقات)
  { cat: 'accessories', name: 'screen-protector', prompt: 'Professional product photography of phone screen protector glass on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'accessories', name: 'phone-stand', prompt: 'Professional product photography of phone stand holder on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'accessories', name: 'cable-usb-c', prompt: 'Professional product photography of USB-C charging cable on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'accessories', name: 'power-bank', prompt: 'Professional product photography of power bank portable charger on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'accessories', name: 'phone-ring-holder', prompt: 'Professional product photography of phone ring holder stand on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'accessories', name: 'tempered-glass', prompt: 'Professional product photography of tempered glass screen protector on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },

  // Chargers (شواحن)
  { cat: 'chargers', name: 'charger-fast-30w', prompt: 'Professional product photography of 30W fast charger on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'chargers', name: 'charger-wireless-pad', prompt: 'Professional product photography of wireless charging pad on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'chargers', name: 'charger-car', prompt: 'Professional product photography of car phone charger on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'chargers', name: 'charger-multi-port', prompt: 'Professional product photography of multi-port USB charger on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },

  // Audio (سماعات)
  { cat: 'audio', name: 'earbuds-generic', prompt: 'Professional product photography of wireless earbuds on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'audio', name: 'headphones-over-ear', prompt: 'Professional product photography of over-ear headphones on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'audio', name: 'speaker-bluetooth', prompt: 'Professional product photography of bluetooth speaker on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },

  // Wearables (ساعات)
  { cat: 'wearables', name: 'smartwatch-generic', prompt: 'Professional product photography of smartwatch on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
  { cat: 'wearables', name: 'fitness-band', prompt: 'Professional product photography of fitness band on dark navy gradient background, studio lighting, gold accents, ultra detailed, premium feel, 8k, no text, no logos' },
]

async function main() {
  console.log('🎨 Initializing Z-AI SDK...')
  const zai = await ZAI.create()

  let generated = 0
  let failed = 0

  for (const item of ITEMS) {
    const dir = path.join(LIBRARY, item.cat)
    const outPath = path.join(dir, `${item.name}.png`)
    if (fs.existsSync(outPath)) {
      console.log(`  ⊙ ${item.cat}/${item.name} (cached)`)
      continue
    }
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    let ok = false
    for (let i = 0; i < 2; i++) {
      try {
        const res = await zai.images.generations.create({ prompt: item.prompt, size: '1024x1024' as const })
        if (res.data?.[0]?.base64) {
          fs.writeFileSync(outPath, Buffer.from(res.data[0].base64, 'base64'))
          console.log(`  ✓ ${item.cat}/${item.name}`)
          ok = true
          generated++
          break
        }
      } catch (e: any) {
        if (i === 0) await new Promise(r => setTimeout(r, 2000))
      }
    }
    if (!ok) {
      console.log(`  ✗ ${item.cat}/${item.name}`)
      failed++
    }
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\n✅ Generated: ${generated}, Failed: ${failed}`)
  console.log(`Total library images: ${findFiles(LIBRARY).length}`)
}

function findFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...findFiles(full))
    else if (entry.name.endsWith('.png')) results.push(full)
  }
  return results
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
