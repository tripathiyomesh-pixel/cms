'use client';
import { useState, useEffect, createContext, useContext } from 'react';

const CURRENCIES = [
  { code:'AED', symbol:'AED', rate:1,      flag:'🇦🇪', name:'UAE Dirham' },
  { code:'USD', symbol:'$',   rate:0.2723, flag:'🇺🇸', name:'US Dollar' },
  { code:'SAR', symbol:'SAR', rate:1.021,  flag:'🇸🇦', name:'Saudi Riyal' },
  { code:'GBP', symbol:'£',   rate:0.2149, flag:'🇬🇧', name:'British Pound' },
  { code:'EUR', symbol:'€',   rate:0.2529, flag:'🇪🇺', name:'Euro' },
  { code:'INR', symbol:'₹',   rate:22.76,  flag:'🇮🇳', name:'Indian Rupee' },
];

export const CurrencyContext = createContext({ currency:CURRENCIES[0], convert:(v)=>v, format:(v)=>v });
export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(CURRENCIES[0]);

  useEffect(()=>{
    const saved = localStorage.getItem('currency');
    if (saved) {
      const found = CURRENCIES.find(c=>c.code===saved);
      if (found) setCurrency(found);
    }
  },[]);

  const convert = (valueInAED) => {
    const v = parseFloat(valueInAED)||0;
    return (v * currency.rate).toFixed(2);
  };

  const format = (valueInAED) => {
    const converted = parseFloat(convert(valueInAED));
    return `${currency.symbol} ${converted.toLocaleString('en-AE', { minimumFractionDigits:0, maximumFractionDigits:0 })}`;
  };

  const changeCurrency = (code) => {
    const found = CURRENCIES.find(c=>c.code===code);
    if (found) { setCurrency(found); localStorage.setItem('currency',code); }
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencies:CURRENCIES, changeCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export default function CurrencySwitcher({ className='' }) {
  const { currency, currencies, changeCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button onClick={()=>setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-ink-200 hover:border-gold-400 transition-colors bg-white text-ink-600">
        <span>{currency.flag}</span>
        <span>{currency.code}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={()=>setOpen(false)}/>
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-ink-100 py-1 min-w-[180px]">
            {currencies.map(c=>(
              <button key={c.code} onClick={()=>{ changeCurrency(c.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${currency.code===c.code?'bg-gold-50 text-gold-700':'text-ink-600 hover:bg-ink-50'}`}>
                <span className="text-base">{c.flag}</span>
                <div>
                  <div className="font-medium">{c.code}</div>
                  <div className="text-[10px] text-ink-400">{c.name}</div>
                </div>
                {currency.code===c.code && <svg className="ml-auto" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/></svg>}
              </button>
            ))}
            <div className="px-4 py-2 border-t border-ink-100 mt-1">
              <p className="text-[10px] text-ink-300">Rates are approximate. Final price in AED.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
