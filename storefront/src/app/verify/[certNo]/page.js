'use client';
import { useEffect, useState } from 'react';
import { certAPI } from '@/lib/api';
import { CheckCircle, XCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyCertPage({ params }) {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(()=>{
    certAPI.verify(params.certNo)
      .then(r=>setResult(r.data.data))
      .catch(e=>setError(e.response?.status===404?'Certificate not found':'Verification failed'))
      .finally(()=>setLoading(false));
  },[params.certNo]);

  if (loading) return <div className="pt-32 text-center py-20 text-ink-400">Verifying certificate…</div>;

  return (
    <div className="pt-24 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/verify" className="flex items-center gap-2 text-sm text-ink-400 hover:text-gold-600 mb-8"><ArrowLeft size={14}/> Back to verification</Link>
      {error ? (
        <div className="card p-8 text-center border-red-100">
          <XCircle size={40} className="mx-auto text-red-400 mb-4"/>
          <h2 className="font-serif text-xl text-ink-700 mb-2">Not Found</h2>
          <p className="text-ink-400 text-sm">{error}</p>
          <p className="text-xs text-ink-300 mt-2 font-mono">{params.certNo}</p>
        </div>
      ) : result && (
        <div className="card p-8 border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle size={28} className="text-green-500"/>
            <div><h2 className="font-serif text-xl text-ink-800">Verified Certificate</h2><p className="text-xs text-ink-400 font-mono mt-0.5">{params.certNo}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['Product',result.product_name],['SKU',result.sku],['Lab',result.cert_lab||result.primary_cert_lab],
              ['Cert No.',result.cert_number||result.primary_cert_no],['Shape',result.shape],
              ['Carat',result.carat?Number(result.carat).toFixed(2)+'ct':null],
              ['Color',result.color],['Clarity',result.clarity],['Cut',result.cut],
              ['Type',result.diamond_type==='LAB_GROWN'?'Lab-Grown Diamond':result.diamond_type?'Natural Diamond':result.gemstone_type],
              ['Origin',result.country_of_origin],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} className="bg-ink-50 rounded-xl p-3">
                <p className="text-[10px] text-ink-400 uppercase tracking-wide mb-0.5">{k}</p>
                <p className="text-sm font-semibold text-ink-700">{v}</p>
              </div>
            ))}
          </div>
          {result.cert_url && (
            <a href={result.cert_url} target="_blank" rel="noreferrer" className="mt-6 btn-outline-gold w-full justify-center text-sm">
              <ExternalLink size={14}/> View on {result.cert_lab||result.primary_cert_lab} website
            </a>
          )}
        </div>
      )}
    </div>
  );
}
