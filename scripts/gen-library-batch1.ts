/**
 * Generate library images batch 1: Bluetooth earbuds + speakers
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const LIBRARY = '/home/z/my-project/public/library'

const ITEMS = [
  // Bluetooth earbuds (سماعات بلوتوث إذن) - different brands
  { cat: 'audio', name: 'earbuds-apple-airpods-pro', prompt: 'Professional product photography of white wireless earbuds in charging case, Apple AirPods style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury, 8k, no text, no logos' },
  { cat: 'audio', name: 'earbuds-samsung-buds', prompt: 'Professional product photography of black wireless earbuds in charging case, Samsung Galaxy Buds style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'earbuds-xiaomi-redmi', prompt: 'Professional product photography of white wireless earbuds in round charging case, Xiaomi Redmi Buds style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'earbuds-oppo', prompt: 'Professional product photography of blue wireless earbuds in charging case, Oppo Enco style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'earbuds-jbl', prompt: 'Professional product photography of orange wireless earbuds in charging case, JBL style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'earbuds-sony', prompt: 'Professional product photography of black wireless earbuds in charging case, Sony WF style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury, 8k, no text, no logos' },
  { cat: 'audio', name: 'earbuds-realme', prompt: 'Professional product photography of yellow wireless earbuds in charging case, Realme Buds style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'earbuds-honor', prompt: 'Professional product photography of white wireless earbuds in charging case, Honor earbuds style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'earbuds-nothing', prompt: 'Professional product photography of transparent wireless earbuds in charging case, Nothing Ear style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'earbuds-anker', prompt: 'Professional product photography of black wireless earbuds in charging case, Anker Soundcore style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },

  // Bluetooth speakers (سماعات بلوتوث خارجية)
  { cat: 'audio', name: 'speaker-jbl-flip', prompt: 'Professional product photography of cylindrical bluetooth speaker, JBL Flip style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'speaker-marshall', prompt: 'Professional product photography of retro bluetooth speaker with leather look, Marshall style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury, 8k, no text, no logos' },
  { cat: 'audio', name: 'speaker-sonos', prompt: 'Professional product photography of modern bluetooth speaker, Sonos style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'speaker-bose', prompt: 'Professional product photography of compact bluetooth speaker, Bose style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury, 8k, no text, no logos' },
  { cat: 'audio', name: 'speaker-xiaomi', prompt: 'Professional product photography of small portable bluetooth speaker, Xiaomi style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'speaker-anker', prompt: 'Professional product photography of waterproof bluetooth speaker, Anker Soundcore style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
  { cat: 'audio', name: 'speaker-harman', prompt: 'Professional product photography of premium bluetooth speaker, Harman Kardon style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium luxury, 8k, no text, no logos' },
  { cat: 'audio', name: 'speaker-tribit', prompt: 'Professional product photography of mini bluetooth speaker, Tribit style, dark navy gradient background, studio lighting, gold accents, ultra detailed, premium, 8k, no text, no logos' },
]

async function main() {
  console.log('🎨 Generating batch 1: earbuds + speakers...')
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
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
