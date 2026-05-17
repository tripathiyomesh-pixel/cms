'use client';
import { useEffect, useState } from 'react';
import { sfAPI, certAPI } from '@/lib/api';
import ImageGallery from '@/components/ui/ImageGallery';
import WhatsAppEnquiry from '@/components/ui/WhatsAppEnquiry';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Shield, Scale } from 'lucide-react';

const GRADE = { Excellent:'text-green-600 font-semibold','Very Good':'text-blue-600','Good':'text-ink-500','Fair':'text-amber-500','Poor':'text-red-500' };

export default function DiamondDetailPage({ params }) {
  const [diamond, setDiamond] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sfAPI.get ? null : null; // ensure import
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/diamonds/${params.id}`)
      .then(r => r.json()).then(r => setDiamond(r.data)).catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="pt-32 text-center py-20 text-ink-400">Loading diamond details…</div>;
  if (!diamond) return <div className="pt-32 text-center py-20"><p className="text-ink-500">Diamond not found.</p><Link href="/diamonds" className="btn-gold mt-4">Back to diamonds</Link></div>;

  const imgs = Array.isArray(diamond.media) ? diamond.media.filter(m => m?.file_url) : [];

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/diamonds" className="flex items-center gap-2 text-sm text-ink-400 hover:text-gold-600 mb-6 transition-colors">
        <ArrowLeft size={14}/> Back to diamonds
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left — Gallery */}
        <div>
          <ImageGallery images={imgs} alt={diamond.name}/>
        </div>

        {/* Right — Details */}
        <div>
          {/* Type badge */}
          <div className="flex gap-2 mb-3">
            <span className={`badge ${diamond.diamond_type==='LAB_GROWN'?'badge-lab':'badge-natural'}`}>
              {diamond.diamond_type==='LAB_GROWN'?'Lab-Grown Diamond':'Natural Diamond'}
            </span>
            {diamond.primary_cert_lab && <span className="badge badge-cert">{diamond.primary_cert_lab} Certified</span>}
          </div>

          <h1 className="font-serif text-2xl lg:text-3xl text-ink-800 mb-2">{diamond.name || `${diamond.shape} ${diamond.carat}ct ${diamond.color} ${diamond.clarity}`}</h1>
          <p className="text-sm text-ink-400 font-mono mb-4">{diamond.sku}</p>

          {/* Price */}
          <div className="mb-6 pb-6 border-b border-ink-100">
            <div className="text-3xl font-bold text-ink-800">{diamond.currency} {Number(diamond.final_price || 0).toLocaleString()}</div>
            {diamond.rap_rate && diamond.carat && (
              <p className="text-xs text-ink-400 mt-1">Rap: ${diamond.rap_rate}/ct · {diamond.rap_discount_pct < 0 ? Math.abs(diamond.rap_discount_pct) + '% below' : diamond.rap_discount_pct + '% above'} Rapaport</p>
            )}
          </div>

          {/* 4Cs */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">The 4Cs</p>
            <div className="grid grid-cols-4 gap-3">
              {[['Shape',diamond.shape],['Carat',diamond.carat?Number(diamond.carat).toFixed(2)+'ct':'—'],['Color',diamond.color||'—'],['Clarity',diamond.clarity||'—']].map(([k,v])=>(
                <div key={k} className="text-center bg-ink-50 rounded-xl p-3">
                  <div className="text-xs text-ink-400 mb-1">{k}</div>
                  <div className="text-sm font-bold text-ink-700">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Grading */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">Advanced grading</p>
            <div className="grid grid-cols-2 gap-2">
              {[['Cut',diamond.cut],['Polish',diamond.polish],['Symmetry',diamond.symmetry],['Fluorescence',diamond.fluorescence]].filter(([,v])=>v).map(([k,v])=>(
                <div key={k} className="flex justify-between items-center py-2 border-b border-ink-100">
                  <span className="text-xs text-ink-400">{k}</span>
                  <span className={`text-xs ${GRADE[v]||'text-ink-600'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Measurements */}
          {(diamond.meas_length || diamond.table_percent) && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">Measurements</p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {diamond.meas_length && <div className="bg-ink-50 rounded-lg p-2"><div className="text-ink-400">L×W×D</div><div className="font-medium text-ink-600">{diamond.meas_length}×{diamond.meas_width}×{diamond.meas_depth}mm</div></div>}
                {diamond.table_percent && <div className="bg-ink-50 rounded-lg p-2"><div className="text-ink-400">Table</div><div className="font-medium text-ink-600">{diamond.table_percent}%</div></div>}
                {diamond.depth_percent && <div className="bg-ink-50 rounded-lg p-2"><div className="text-ink-400">Depth</div><div className="font-medium text-ink-600">{diamond.depth_percent}%</div></div>}
              </div>
            </div>
          )}

          {/* Certificate */}
          {diamond.primary_cert_no && (
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-blue-600"/>
                <p className="text-sm font-semibold text-blue-700">Certificate</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-mono">{diamond.primary_cert_lab} {diamond.primary_cert_no}</p>
                </div>
                <div className="flex gap-2">
                  {diamond.cert_url && <a href={diamond.cert_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><ExternalLink size={11}/>View cert</a>}
                  <Link href={`/verify/${diamond.primary_cert_no}`} className="text-xs text-blue-600 hover:underline">Verify</Link>
                </div>
              </div>
            </div>
          )}

          {/* Availability */}
          {diamond.is_available === false && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              ⚠️ This diamond is currently on hold. Enquire for availability.
            </div>
          )}

          {/* CTA */}
          <div className="space-y-3">
            <WhatsAppEnquiry product={diamond} className="w-full"/>
            <Link href="/appointment" className="btn-outline-gold w-full justify-center py-3">
              Book appointment to view in person
            </Link>
          </div>
        </div>
      </div>

      {/* Related diamonds */}
      {diamond.related?.length > 0 && (
        <div className="mt-16">
          <h2 className="font-serif text-2xl text-ink-800 mb-6">Similar diamonds</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {diamond.related.map(d=>(
              <Link key={d.id} href={`/diamonds/${d.id}`} className="card p-4 hover:shadow-md hover:border-gold-200 transition-all">
                <p className="text-xs text-ink-400 mb-1">{d.shape}</p>
                <p className="text-sm font-semibold text-ink-700">{d.carat?Number(d.carat).toFixed(2)+'ct':''} {d.color} {d.clarity}</p>
                <p className="text-sm font-bold text-gold-600 mt-2">{d.currency} {Number(d.final_price||0).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
