/**
 * HomePage — full landing page composing all sections.
 */
'use client'

import { useHomeData } from '@/shared/hooks/queries'
import { useUIStore } from '@/shared/stores/ui.store'
import { HeroSection } from './hero-section'
import { CategoriesSection } from './categories-section'
import { ProductCarousel } from './product-carousel'
import { OffersBanner } from './offers-banner'
import { BrandsSection } from './brands-section'
import { TestimonialsSection } from './testimonials-section'
import { FAQSection } from './faq-section'
import { FeaturesStrip } from './features-strip'

export function HomePage() {
  const { data, isLoading } = useHomeData()
  const { resetFilters, setProductFilters, setView } = useUIStore()

  const viewAll = (filter: any) => () => {
    resetFilters()
    setProductFilters(filter)
    setView('products')
  }

  return (
    <>
      <HeroSection />
      <FeaturesStrip />
      <CategoriesSection />
      <ProductCarousel
        title="منتجات مميزة"
        subtitle="اختياراتنا الأفضل لك"
        products={data?.featured ?? []}
        isLoading={isLoading}
        viewAllAction={viewAll({ isFeatured: true })}
      />
      <OffersBanner />
      <ProductCarousel
        title="الأكثر مبيعاً"
        subtitle="الأكثر طلباً من عملائنا"
        products={data?.bestSellers ?? []}
        isLoading={isLoading}
        viewAllAction={viewAll({ isBestSeller: true })}
        accent
      />
      <ProductCarousel
        title="وصل حديثاً"
        subtitle="أحدث المنتجات في متجرنا"
        products={data?.newArrivals ?? []}
        isLoading={isLoading}
        viewAllAction={viewAll({ isNewArrival: true })}
      />
      <BrandsSection />
      <ProductCarousel
        title="عروض حصرية"
        subtitle="خصومات لفترة محدودة"
        products={data?.onSale ?? []}
        isLoading={isLoading}
        viewAllAction={viewAll({ isOnSale: true })}
      />
      <TestimonialsSection />
      <FAQSection />
    </>
  )
}
