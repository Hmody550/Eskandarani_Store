/**
 * Manifest — PWA support
 */
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'أسكندراني فون — متجر الهواتف الذكية',
    short_name: 'أسكندراني فون',
    description: 'متجر الهواتف الذكية والإكسسوارات الأصلية بأفضل الأسعار',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      { src: '/askandarani-brand-logo.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    categories: ['shopping', 'electronics'],
  }
}
