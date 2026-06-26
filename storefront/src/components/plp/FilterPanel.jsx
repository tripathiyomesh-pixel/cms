'use client';
import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';

const CATEGORIES  = ['Rings','Necklaces','Bracelets','Earrings','Sets','Bangles','Pendants'];
const COLLECTIONS = ['Adamas','Classics','Farashat','Frost','High Jewellery','Ice Deco','Luluaat','Mallika','Vivid Deco','Vivid Pendant Sets'];
const METALS      = ['18K White Gold','18K Yellow Gold','18K Rose Gold','22K Gold','Platinum'];
const STONES      = ['Diamond','Sapphire','Ruby','Emerald','Pearl','Other'];
const PRICE_RANGES = [
  { label:'Under AED 5,000',       min:0,      max:5000   },
  { label:'AED 5,000 – 15,000',    min:5000,   max:15000  },
  { label:'AED 15,000 – 50,000',   min:15000,  max:50000  },
  { label:'AED 50,000 – 100,000',  min:50000,  max:100000 },
  { label:'Over AED 100,000',      min:100000, max:null   },
];

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom:'1px solid var(--color-border)', padding:'14px 0' }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',background:'none',border:'none',cursor:'pointer',padding:0 }}>
        <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:T }}>{title}</span>
        <ChevronDown size={13} color={M} style={{ transform:open?'rotate(180deg)':'rotate(0)',transition:'transform 200ms ease' }}/>
      </button>
      <div style={{ maxHeight:open?600:0,overflow:'hidden',transition:'max-height 250ms ease' }}>
        <div style={{ paddingTop:12 }}>{children}</div>
      </div>
    </div>
  );
}

function CheckItem({ label, checked, onChange }) {
  return (
    <label style={{ display:'flex',alignItems:'center',gap:10,padding:'5px 0',cursor:'pointer',fontSize:13,color:T }}>
      <input type="checkbox" checked={!!checked} onChange={e=>onChange(e.target.checked)}
        style={{ accentColor:G,width:14,height:14,cursor:'pointer',flexShrink:0 }}/>
      {label}
    </label>
  );
}

export default function FilterPanel({ filters = {}, onChange, onClear, layout = 'sidebar' }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });
  const toggle = (k, v) => {
    const cur = filters[k];
    onChange({ ...filters, [k]: cur === v ? undefined : v });
  };

  const activeCount = Object.values(filters).filter(v => v !== undefined && v !== '' && v !== null).length;

  const inner = (
    <div>
      {/* Active filter chips */}
      {activeCount > 0 && (
        <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:16 }}>
          {filters.category && (
            <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',background:G,color:'#fff',fontSize:11,borderRadius:20 }}>
              {filters.category}
              <button onClick={()=>set('category',undefined)} style={{ background:'none',border:'none',cursor:'pointer',color:'#fff',lineHeight:1,padding:0 }}><X size={11}/></button>
            </span>
          )}
          {filters.metal_type && (
            <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',background:G,color:'#fff',fontSize:11,borderRadius:20 }}>
              {filters.metal_type}
              <button onClick={()=>set('metal_type',undefined)} style={{ background:'none',border:'none',cursor:'pointer',color:'#fff',lineHeight:1,padding:0 }}><X size={11}/></button>
            </span>
          )}
          {(filters.price_min||filters.price_max) && (
            <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',background:G,color:'#fff',fontSize:11,borderRadius:20 }}>
              Price filter
              <button onClick={()=>onChange({...filters,price_min:undefined,price_max:undefined})} style={{ background:'none',border:'none',cursor:'pointer',color:'#fff',lineHeight:1,padding:0 }}><X size={11}/></button>
            </span>
          )}
          <button onClick={onClear} style={{ fontSize:11,color:G,background:'none',border:'none',cursor:'pointer',textDecoration:'underline' }}>Clear All</button>
        </div>
      )}

      {/* Category */}
      <Section title="Category">
        <CheckItem label="All Categories" checked={!filters.category} onChange={()=>set('category',undefined)}/>
        {CATEGORIES.map(c => (
          <CheckItem key={c} label={c} checked={filters.category===c} onChange={()=>toggle('category',c)}/>
        ))}
      </Section>

      {/* Collection */}
      <Section title="Collection" defaultOpen={false}>
        <CheckItem label="All Collections" checked={!filters.collection} onChange={()=>set('collection',undefined)}/>
        {COLLECTIONS.map(c => (
          <CheckItem key={c} label={c} checked={filters.collection===c} onChange={()=>toggle('collection',c)}/>
        ))}
      </Section>

      {/* Metal */}
      <Section title="Metal Type" defaultOpen={false}>
        <CheckItem label="All Metals" checked={!filters.metal_type} onChange={()=>set('metal_type',undefined)}/>
        {METALS.map(m => (
          <CheckItem key={m} label={m} checked={filters.metal_type===m} onChange={()=>toggle('metal_type',m)}/>
        ))}
      </Section>

      {/* Price */}
      <Section title="Price Range" defaultOpen={false}>
        {PRICE_RANGES.map(r => {
          const active = filters.price_min===r.min && filters.price_max===r.max;
          return (
            <CheckItem key={r.label} label={r.label} checked={active}
              onChange={()=>active
                ? onChange({...filters,price_min:undefined,price_max:undefined})
                : onChange({...filters,price_min:r.min,price_max:r.max})}
            />
          );
        })}
        <div style={{ display:'flex',gap:8,marginTop:10 }}>
          <input type="number" placeholder="Min" value={filters.price_min||''} onChange={e=>set('price_min',e.target.value?Number(e.target.value):undefined)}
            style={{ flex:1,padding:'7px 10px',border:'1px solid var(--color-border)',fontSize:12,outline:'none',background:'var(--color-bg)' }}/>
          <input type="number" placeholder="Max" value={filters.price_max||''} onChange={e=>set('price_max',e.target.value?Number(e.target.value):undefined)}
            style={{ flex:1,padding:'7px 10px',border:'1px solid var(--color-border)',fontSize:12,outline:'none',background:'var(--color-bg)' }}/>
        </div>
      </Section>

      {/* Stone */}
      <Section title="Stone Type" defaultOpen={false}>
        {STONES.map(s => (
          <CheckItem key={s} label={s} checked={filters.stone_type===s} onChange={()=>toggle('stone_type',s)}/>
        ))}
      </Section>

      {/* Availability */}
      <Section title="Availability" defaultOpen={false}>
        <CheckItem label="New Arrivals"  checked={!!filters.is_new_arrival} onChange={v=>set('is_new_arrival',v||undefined)}/>
        <CheckItem label="Best Sellers"  checked={!!filters.is_best_seller} onChange={v=>set('is_best_seller',v||undefined)}/>
        <CheckItem label="Featured"      checked={!!filters.is_featured}    onChange={v=>set('is_featured',v||undefined)}/>
      </Section>
    </div>
  );

  if (layout === 'sidebar') {
    return (
      <aside style={{ width:280,flexShrink:0,position:'sticky',top:80,height:'calc(100vh - 80px)',overflowY:'auto',paddingRight:24,paddingBottom:40 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,paddingBottom:12,borderBottom:'1px solid var(--color-border)' }}>
          <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:T }}>Filters</span>
          {activeCount > 0 && (
            <button onClick={onClear} style={{ fontSize:11,color:G,background:'none',border:'none',cursor:'pointer' }}>Clear ({activeCount})</button>
          )}
        </div>
        {inner}
      </aside>
    );
  }

  // drawer layout (mobile)
  return <div style={{ padding:'0 24px 24px' }}>{inner}</div>;
}