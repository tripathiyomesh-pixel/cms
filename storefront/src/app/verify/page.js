'use client';
import { useState } from 'react';
import { certAPI } from '@/lib/api';
import { Search, CheckCircle, XCircle, Shield, ExternalLink } from 'lucide-react';

export default function VerifyPage() {
  const [certNo, setCertNo]   = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleVerify = async () => {
    if (!certNo.trim()) return;
    setLoading(true); setResult(null); setError('');
    try {
      const r = await certAPI.verify(certNo.trim());
      setResult(r.data.data);
    } catch (e) {
      setError(e.response?.status===404 ? 'Certificate not found. Please check the number and try again.' : 'Verification failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="pt-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gold-50 border-2 border-gold-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield size={32} className="text-gold-500"/>
        </div>
        <h1 className="font-serif text-3xl lg:text-4xl text-ink-800 mb-3">Certificate Verification</h1>
        <p className="text-ink-400 text-lg">Enter a GIA, IGI, or gemstone certificate number to verify authenticity</p>
      </div>

      {/* Search box */}
      <div className="card p-6 mb-8">
        <div className="flex gap-3">
          <input type="text" value={certNo} onChange={e=>setCertNo(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleVerify()}
            placeholder="Enter certificate number (e.g. 2141234567)"
            className="flex-1 input-field text-lg font-mono"/>
          <button onClick={handleVerify} disabled={loading||!certNo.trim()}
            className="btn-gold px-6 disabled:opacity-50">
            <Search size={18}/>{loading?'Checking…':'Verify'}
          </button>
        </div>
        <p className="text-xs text-ink-400 mt-2">Supports GIA, IGI, HRD diamond certificates and GRS, SSEF, Gübelin gemstone certificates</p>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-6 border-red-100 bg-red-50 flex items-start gap-3">
          <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5"/>
          <div><p className="text-sm font-medium text-red-700">Not found</p><p className="text-xs text-red-500 mt-0.5">{error}</p></div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="card p-6 border-green-100 animate-fade-in">
          <div className="flex items-start gap-3 mb-6 pb-5 border-b border-green-100">
            <CheckCircle size={24} className="text-green-500 flex-shrink-0"/>
            <div>
              <p className="text-base font-semibold text-green-700">Certificate verified</p>
              <p className="text-sm text-ink-500 mt-0.5">This certificate exists in our database</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Product</p>
              <p className="text-sm font-medium text-ink-700">{result.product_name||'—'}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">SKU</p>
              <p className="text-sm font-mono text-ink-700">{result.sku||'—'}</p>
            </div>
            {result.cert_lab||result.primary_cert_lab ? <div>
              <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Lab</p>
              <p className="text-sm font-semibold text-ink-700">{result.cert_lab||result.primary_cert_lab}</p>
            </div> : null}
            {result.cert_number||result.primary_cert_no ? <div>
              <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Certificate no.</p>
              <p className="text-sm font-mono text-ink-700">{result.cert_number||result.primary_cert_no}</p>
            </div> : null}
            {result.shape && <div><p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Shape</p><p className="text-sm font-medium text-ink-700">{result.shape}</p></div>}
            {result.carat && <div><p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Carat</p><p className="text-sm font-semibold text-ink-700">{Number(result.carat).toFixed(2)} ct</p></div>}
            {result.color && <div><p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Color</p><p className="text-sm font-bold text-ink-700 font-mono">{result.color}</p></div>}
            {result.clarity && <div><p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Clarity</p><p className="text-sm font-bold text-ink-700 font-mono">{result.clarity}</p></div>}
            {result.cut && <div><p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Cut</p><p className="text-sm text-green-700 font-semibold">{result.cut}</p></div>}
            {result.diamond_type && <div><p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Type</p><p className="text-sm font-medium text-ink-700">{result.diamond_type==='LAB_GROWN'?'Lab-Grown Diamond':'Natural Diamond'}</p></div>}
            {result.gemstone_type && <div><p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Gemstone</p><p className="text-sm font-medium text-ink-700">{result.gemstone_type}</p></div>}
            {result.country_of_origin && <div><p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Origin</p><p className="text-sm text-ink-700">{result.country_of_origin}</p></div>}
          </div>

          {(result.cert_url) && (
            <a href={result.cert_url} target="_blank" rel="noreferrer"
              className="btn-outline-gold text-sm w-full justify-center">
              <ExternalLink size={14}/> View official certificate on {result.cert_lab||result.primary_cert_lab} website
            </a>
          )}
        </div>
      )}

      {/* How it works */}
      {!result && !error && (
        <div className="mt-12">
          <h3 className="text-sm font-semibold text-ink-600 uppercase tracking-wide mb-4">How it works</h3>
          <div className="grid grid-cols-3 gap-4">
            {[['1','Enter cert number','Find the certificate number on your stone or paperwork'],['2','Instant verification','We check our database for this certificate'],['3','View details','See the full stone specifications and lab information']].map(([n,t,d])=>(
              <div key={n} className="text-center">
                <div className="w-8 h-8 bg-gold-100 text-gold-700 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">{n}</div>
                <p className="text-xs font-medium text-ink-700 mb-1">{t}</p>
                <p className="text-[11px] text-ink-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
