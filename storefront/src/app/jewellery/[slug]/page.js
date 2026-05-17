'use client';
import { useEffect, useState } from 'react';
import ImageGallery from '@/components/ui/ImageGallery';
import WhatsAppEnquiry from '@/components/ui/WhatsAppEnquiry';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';

export default function JewelleryDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/products/${params.slug}`)
      .then(r => r.json()).then(r => {
        setProduct(r.data);
        if (r.data?.variants?.length) setSelectedVariant(r.data.variants[0]);
      }).catch(() => {}).finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <div className="pt-32 text-center py-20 text-ink-400">Loading…</div>;
  if (!product) return <div className="pt-32 text-center py-20"><p className="text-ink-500">Product not found.</p><Link href="/jewellery" className="btn-gold mt-4 inline-block">Back to jewellery</Link></div>;

  const imgs = Array.isArray(product.media) ? product.media.filter(m => m?.file_url) : [];
  const displayPrice = selectedVariant
    ? (parseFloat(product.final_price||0) + parseFloat(selectedVariant.price_delta||0))
    : parseFloat(product.final_price||0);

  const displayProduct = { ...product, final_price: displayPrice, ...(selectedVariant?.attributes||{}) };

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-ink-400 mb-6">
        <Link href="/" className="hover:text-gold-600">Home</Link>
        <span>/</span>
        <Link href="/jewellery" className="hover:text-gold-600">Jewellery</Link>
        <span>/</span>
        <span className="text-ink-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <ImageGallery images={imgs} alt={product.name}/>
        </div>

        {/* Info */}
        <div>
          {/* Category + badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {product.metal_type && <span className="badge bg-gold-100 text-gold-700 capitalize">{product.metal_type.replace('_',' ')} {product.purity}</span>}
            {product.is_featured && <span className="badge badge-gold">Featured</span>}
            {product.occasion && <span className="badge bg-pink-50 text-pink-700 capitalize">{product.occasion}</span>}
          </div>

          <h1 className="font-serif text-2xl lg:text-3xl text-ink-800 mb-2">{product.name}</h1>
          <p className="text-xs text-ink-400 font-mono mb-4">SKU: {product.sku}</p>

          {/* Price */}
          <div className="mb-6 pb-6 border-b border-ink-100">
            <div className="text-3xl font-bold text-ink-800">{product.currency} {displayPrice.toLocaleString()}</div>
            {product.gross_weight && <p className="text-xs text-ink-400 mt-1">{product.gross_weight}g · {product.purity} {product.metal_type?.replace('_',' ')}</p>}
          </div>

          {/* Description */}
          {product.description && <p className="text-sm text-ink-500 leading-relaxed mb-6">{product.description}</p>}

          {/* Variants — ring sizes / metals */}
          {product.variants?.length > 0 && (
            <div className="mb-6">
              {/* Group variants by type */}
              {(() => {
                const metalVariants = product.variants.filter(v => v.attributes?.metal);
                const sizeVariants  = product.variants.filter(v => v.attributes?.size);
                return (
                  <>
                    {metalVariants.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Metal option</p>
                        <div className="flex flex-wrap gap-2">
                          {metalVariants.map(v => (
                            <button key={v.id} onClick={() => setSelectedVariant(v)}
                              className={`px-4 py-2 rounded-xl border text-xs font-medium transition-all ${selectedVariant?.id===v.id?'border-gold-500 bg-gold-50 text-gold-700':'border-ink-200 text-ink-500 hover:border-gold-300'}`}>
                              {v.attributes.metal}
                              {v.price_delta > 0 && <span className="text-ink-400 ml-1">+{product.currency} {Number(v.price_delta).toLocaleString()}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {sizeVariants.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Ring size</p>
                        <div className="flex flex-wrap gap-2">
                          {sizeVariants.map(v => (
                            <button key={v.id} onClick={() => setSelectedVariant(v)}
                              className={`w-10 h-10 rounded-xl border text-xs font-bold transition-all ${selectedVariant?.id===v.id?'border-gold-500 bg-gold-50 text-gold-700':'border-ink-200 text-ink-500 hover:border-gold-300'}`}>
                              {v.attributes.size || v.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Specs */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">Specifications</p>
            <div className="space-y-2">
              {[
                ['Metal', product.metal_type?.replace('_',' ')],
                ['Purity', product.purity],
                ['Gross weight', product.gross_weight ? `${product.gross_weight}g` : null],
                ['Net weight', product.net_weight ? `${product.net_weight}g` : null],
                ['Gender', product.gender],
                ['Style', product.style],
                ['Occasion', product.occasion],
              ].filter(([,v])=>v).map(([k,v])=>(
                <div key={k} className="flex justify-between py-2 border-b border-ink-50 text-sm">
                  <span className="text-ink-400">{k}</span>
                  <span className="text-ink-600 font-medium capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {product.certifications?.length > 0 && (
            <div className="mb-6 bg-green-50 border border-green-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-green-700 mb-2">Certifications</p>
              {product.certifications.map((c,i) => (
                <p key={i} className="text-xs text-green-600 font-mono">{c.cert_lab} — {c.cert_number}</p>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="space-y-3">
            <WhatsAppEnquiry product={displayProduct} className="w-full"/>
            <div className="flex gap-3">
              <Link href="/appointment" className="btn-outline-gold flex-1 justify-center py-3 text-sm">
                Book appointment
              </Link>
              <button onClick={() => setWishlist(!wishlist)}
                className={`p-3 rounded-full border transition-all ${wishlist?'bg-red-50 border-red-200 text-red-500':'border-ink-200 text-ink-400 hover:border-red-300'}`}>
                <Heart size={18} fill={wishlist?'currentColor':'none'}/>
              </button>
            </div>
          </div>

          {/* Sharing */}
          <div className="mt-4 pt-4 border-t border-ink-100 flex items-center gap-3">
            <span className="text-xs text-ink-400">Share</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(`Check this out: ${product.name} - ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
              target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:text-green-700">WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}
