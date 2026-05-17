'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const SHAPES = ['Round','Oval','Princess','Cushion','Pear','Emerald','Marquise','Asscher','Radiant','Heart'];

export default function DiamondSearchTeaser() {
  const router = useRouter();
  const [filters, setFilters] = useState({ type:'NATURAL', shape:'', min_carat:'', max_carat:'', min_price:'', max_price:'' });
  const set = (k,v) => setFilters(f=>({...f,[k]:v}));

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k,v])=>{ if(v) params.set(k,v); });
    router.push(`/diamonds?${params.toString()}`);
  };

  return (
    <section className="bg-ink-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl lg:text-4xl text-white mb-3">Find Your Perfect Diamond</h2>
          <p className="text-ink-400">Search our certified inventory by shape, carat, and budget</p>
        </div>

        {/* Type selector */}
        <div className="flex justify-center gap-3 mb-8">
          {[['NATURAL','Natural Diamond'],['LAB_GROWN','Lab-Grown Diamond']].map(([v,l])=>(
            <button key={v} onClick={()=>set('type',v)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${filters.type===v?'bg-gold-500 text-white':'bg-white/10 text-ink-300 hover:bg-white/20'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Shape selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SHAPES.map(s=>(
            <button key={s} onClick={()=>set('shape', filters.shape===s?'':s)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${filters.shape===s?'bg-gold-500 border-gold-500 text-white':'border-white/20 text-ink-300 hover:border-gold-400 hover:text-gold-400'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Range inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
          {[
            {k:'min_carat',l:'Min carat',pl:'0.50'},
            {k:'max_carat',l:'Max carat',pl:'3.00'},
            {k:'min_price',l:'Min price (USD)',pl:'1000'},
            {k:'max_price',l:'Max price (USD)',pl:'10000'},
          ].map(f=>(
            <div key={f.k}>
              <label className="block text-xs text-ink-400 mb-1.5">{f.l}</label>
              <input type="number" value={filters[f.k]} onChange={e=>set(f.k,e.target.value)}
                placeholder={f.pl} className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-ink-500 focus:border-gold-400 outline-none"/>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={handleSearch} className="btn-gold px-10 py-4 text-base">
            <Search size={18}/> Search Diamonds
          </button>
        </div>
      </div>
    </section>
  );
}
