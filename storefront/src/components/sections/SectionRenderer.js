'use client';
/**
 * SectionRenderer — picks the right component variant per admin config,
 * plus a generic renderSection() dispatcher for the page builder.
 */

import HeroFullscreen      from './hero/HeroFullscreen';
import HeroSlider          from './hero/HeroSlider';
import HeroSplit           from './hero/HeroSplit';
import HeroVideo           from './hero/HeroVideo';
import HeroMinimal         from './hero/HeroMinimal';

import ProductsGrid        from './products/ProductsGrid';
import ProductsCarousel    from './products/ProductsCarousel';

import CategoriesCircles   from './categories/CategoriesCircles';
import CategoriesCards     from './categories/CategoriesCards';

import TestimonialsCarousel from './testimonials/TestimonialsCarousel';
import TestimonialsGrid     from './testimonials/TestimonialsGrid';

import BrandValues          from './jewellery/BrandValues';
import GoldRateTicker       from './jewellery/GoldRateTicker';
import AppointmentCtaBanner from './jewellery/AppointmentCtaBanner';

// ── VARIANT MAPS ──────────────────────────────────────────────
const HERO_COMPONENTS = {
  fullscreen: HeroFullscreen,
  slider:     HeroSlider,
  split:      HeroSplit,
  video:      HeroVideo,
  minimal:    HeroMinimal,
};

const PRODUCT_COMPONENTS = {
  grid4:    (p) => <ProductsGrid {...p} cols={4}/>,
  grid3:    (p) => <ProductsGrid {...p} cols={3}/>,
  carousel: (p) => <ProductsCarousel {...p}/>,
};

const CATEGORY_COMPONENTS = {
  circles: CategoriesCircles,
  cards:   CategoriesCards,
};

const TESTIMONIAL_COMPONENTS = {
  carousel: TestimonialsCarousel,
  grid:     TestimonialsGrid,
};

// ── VARIANT-BASED SECTION EXPORTS ─────────────────────────────
export function HeroSection({ config = {} }) {
  const type = config.hero_type || 'fullscreen';
  const Component = HERO_COMPONENTS[type] || HeroFullscreen;
  return <Component config={config}/>;
}

export function ProductsSection({ config = {} }) {
  const variant = config.products_variant || 'grid4';
  const render  = PRODUCT_COMPONENTS[variant] || PRODUCT_COMPONENTS.grid4;
  return render({ config });
}

export function CategoriesSection({ config = {} }) {
  const variant   = config.categories_variant || 'circles';
  const Component = CATEGORY_COMPONENTS[variant] || CategoriesCircles;
  return <Component config={config}/>;
}

export function TestimonialsSection({ config = {} }) {
  const variant   = config.testimonials_variant || 'carousel';
  const Component = TESTIMONIAL_COMPONENTS[variant] || TestimonialsCarousel;
  return <Component config={config}/>;
}

// ── GENERIC DISPATCHER ────────────────────────────────────────
// Used by page builder (Puck) and HomeBuilderPage to render any section type.
// type comes from SECTION_REGISTRY in pageSchema.js
const SECTION_MAP = {
  // Hero variants
  hero:            (p) => <HeroSection     config={p}/>,
  hero_fullscreen: (p) => <HeroFullscreen  config={p}/>,
  hero_slider:     (p) => <HeroSlider      config={p}/>,
  hero_split:      (p) => <HeroSplit       config={p}/>,
  hero_video:      (p) => <HeroVideo       config={p}/>,
  hero_minimal:    (p) => <HeroMinimal     config={p}/>,

  // Product listing
  products:          (p) => <ProductsSection  config={p}/>,
  featured_products: (p) => <ProductsSection  config={{ ...p, products_variant: 'carousel' }}/>,
  new_arrivals:      (p) => <ProductsSection  config={{ ...p, products_variant: 'grid4'   }}/>,
  best_sellers:      (p) => <ProductsSection  config={{ ...p, products_variant: 'grid3'   }}/>,

  // Categories
  categories:         (p) => <CategoriesSection config={p}/>,
  category_showcase:  (p) => <CategoriesSection config={{ ...p, categories_variant:'cards'   }}/>,
  category_circles:   (p) => <CategoriesSection config={{ ...p, categories_variant:'circles' }}/>,

  // Testimonials
  testimonials:     (p) => <TestimonialsSection config={p}/>,

  // Jewellery-specific
  brand_values:          (p) => <BrandValues          {...p}/>,
  gold_rate_ticker:      (p) => <GoldRateTicker        {...p}/>,
  appointment_cta_banner:(p) => <AppointmentCtaBanner  {...p}/>,

  // Passthrough for unknown types — renders nothing but doesn't crash
  _fallback: () => null,
};

/**
 * renderSection({ type, props }) — generic section renderer.
 * @param {string} type  — section type from SECTION_REGISTRY
 * @param {object} props — section data/config from database
 */
export function renderSection({ type, props = {} }) {
  const render = SECTION_MAP[type] || SECTION_MAP._fallback;
  return render(props);
}

/**
 * SectionBlock — React component wrapper around renderSection.
 * Use in page builder output: <SectionBlock type="brand_values" props={data}/>
 */
export function SectionBlock({ type, props = {}, className }) {
  const render = SECTION_MAP[type] || SECTION_MAP._fallback;
  const el = render(props);
  if (!el) return null;
  return className ? <div className={className}>{el}</div> : el;
}

export default renderSection;
