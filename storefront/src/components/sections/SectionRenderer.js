'use client';
/**
 * SectionRenderer — reads admin config and renders the right variant
 * 
 * Admin sets:
 *   hero_type:            fullscreen | slider | split | video | minimal
 *   products_variant:     grid4 | grid3 | carousel
 *   categories_variant:   circles | cards
 *   testimonials_variant: carousel | grid
 * 
 * This component picks the right component for each variant
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
  carousel: ProductsCarousel,
};

const CATEGORY_COMPONENTS = {
  circles: CategoriesCircles,
  cards:   CategoriesCards,
};

const TESTIMONIAL_COMPONENTS = {
  carousel: TestimonialsCarousel,
  grid:     TestimonialsGrid,
};

export function HeroSection({ config = {} }) {
  const type = config.hero_type || 'fullscreen';
  const Component = HERO_COMPONENTS[type] || HeroFullscreen;
  return <Component config={config}/>;
}

export function ProductsSection({ config = {} }) {
  const variant = config.products_variant || 'grid4';
  const render  = PRODUCT_COMPONENTS[variant];
  if (!render) return <ProductsGrid config={config} cols={4}/>;
  if (typeof render === 'function' && render.length === 0) return render({ config });
  return <ProductsCarousel config={config}/>;
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
