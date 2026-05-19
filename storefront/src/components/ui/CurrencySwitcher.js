'use client';
import { useState, useEffect, createContext, useContext } from 'react';

const CURRENCIES = [
  { code:'AED', symbol:'AED', rate:1,      flag:'🇦🇪' },
  { code:'USD', symbol:'$',   rate:0.2723, flag:'🇺🇸' },
  { code:'EUR', symbol:'€',   rate:0.2484, flag:'🇪🇺' },
  { code:'GBP', symbol:'£',   rate:0.2143, flag:'🇬🇧' },
  { code:'INR', symbol:'₹',   rate:22.73,  flag:'🇮🇳' },
  { code:'SAR', symbol:'SAR', rate:1.021,  flag:'🇸🇦' },
];

const CurrencyContext = createContext({ currency:'AED', symbol:'AED', convert:(p)=>p, format:(p)=>p });

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('AED');

  useEffect(() => {
    const saved = localStorage.getItem('jcos_currency') || 'AED';
    setCurrency(saved);
  }, []);

  const cur = CURRENCIES.find(c=>c.code===currency) || CURRENCIES[0];

  const convert = (aedPrice) => {
    if (!aedPrice) return 0;
    return parseFloat((parseFloat(aedPrice) * cur.rate).toFixed(2));
  };

  const format = (aedPrice) => {
    const converted = convert(aedPrice);
    return `${cur.symbol} ${converted.toLocaleString('en-AE', { minimumFractionDigits:0, maximumFractionDigits:0 })}`;
  };

  const switchCurrency = (code) => {
    setCurrency(code);
    localStorage.setItem('jcos_currency', code);
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol:cur.symbol, convert, format, switchCurrency, currencies:CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);

export default function CurrencySwitcher() {
  const { currency, switchCurrency, currencies } = useCurrency();

  return (
    <select
      value={currency}
      onChange={e => switchCurrency(e.target.value)}
      style={{
        fontSize:11, fontWeight:500, color:'#6b6b6b',
        background:'transparent', border:'none',
        cursor:'pointer', outline:'none',
        padding:'2px 4px',
      }}>
      {currencies.map(c => (
        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
      ))}
    </select>
  );
}
