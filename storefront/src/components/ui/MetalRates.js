'use client';
import { useEffect, useState } from 'react';
import { sfAPI } from '@/lib/api';
import { TrendingUp } from 'lucide-react';

export default function MetalRates() {
  const [rates, setRates] = useState([]);
  useEffect(()=>{ sfAPI.metalRates().then(r=>setRates(r.data.data||[])).catch(()=>{}); },[]);
  if (!rates.length) return null;

  const show = rates.filter(r=>['gold','silver','platinum'].includes(r.metal?.toLowerCase()));

  return (
    <section className="bg-gold-50 border-y border-gold-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-6 sm:gap-10 justify-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-gold-700">
            <TrendingUp size={14}/> Live metal rates
          </div>
          {show.map(r=>(
            <div key={`${r.metal}-${r.purity}`} className="text-center">
              <div className="text-xs text-gold-600 uppercase tracking-wide">{r.metal} {r.purity}</div>
              <div className="text-sm font-bold text-gold-800">AED {Number(r.rate_aed||r.rate_per_gram).toFixed(2)}/g</div>
            </div>
          ))}
          <div className="text-xs text-gold-500">Updated manually by admin</div>
        </div>
      </div>
    </section>
  );
}
