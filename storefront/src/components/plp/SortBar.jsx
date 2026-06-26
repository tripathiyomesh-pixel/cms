'use client';
import { LayoutGrid, List } from 'lucide-react';

const G = 'var(--color-accent)';
const M = 'var(--color-text-muted)';
const T = 'var(--color-text)';

const SORTS = [
  { value:'featured',   label:'Featured'            },
  { value:'newest',     label:'Newest First'         },
  { value:'price_asc',  label:'Price: Low to High'  },
  { value:'price_desc', label:'Price: High to Low'   },
  { value:'name_asc',   label:'Name: A to Z'         },
];

export default function SortBar({ sort, onSort, total, view = 'grid', onViewChange }) {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid var(--color-border)',marginBottom:20,flexWrap:'wrap',gap:12 }}>
      <span style={{ fontSize:13,color:M }}>{total > 0 ? `${total} products found` : 'Loading...'}</span>
      <div style={{ display:'flex',alignItems:'center',gap:12 }}>
        <select value={sort} onChange={e=>onSort(e.target.value)}
          style={{ padding:'7px 12px',border:'1px solid var(--color-border)',fontSize:12,background:'var(--color-bg)',color:T,cursor:'pointer',outline:'none',letterSpacing:'0.04em' }}>
          {SORTS.map(s=>(
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {onViewChange && (
          <div style={{ display:'flex',border:'1px solid var(--color-border)' }}>
            <button onClick={()=>onViewChange('grid')}
              style={{ padding:'7px 10px',background:view==='grid'?G:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',transition:'background 150ms ease' }}>
              <LayoutGrid size={14} color={view==='grid'?'#fff':M}/>
            </button>
            <button onClick={()=>onViewChange('list')}
              style={{ padding:'7px 10px',background:view==='list'?G:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',transition:'background 150ms ease' }}>
              <List size={14} color={view==='list'?'#fff':M}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}