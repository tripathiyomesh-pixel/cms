'use client';
import Link from 'next/link';

const M = 'var(--color-text-muted)';
const T = 'var(--color-text)';

const SPEC_FIELDS = [
  { key:'metal_type',    label:'Metal Type'     },
  { key:'purity',        label:'Purity'         },
  { key:'gross_weight',  label:'Total Weight',  suffix:'g' },
  { key:'stone_type',    label:'Main Stone'     },
  { key:'stone_carat',   label:'Stone Carat',   suffix:'ct' },
  { key:'stone_color',   label:'Stone Color'    },
  { key:'stone_clarity', label:'Stone Clarity'  },
  { key:'cert_lab',      label:'Certificate'    },
  { key:'cert_no',       label:'Cert Number',   link:true },
  { key:'sku',           label:'SKU'            },
];

export default function SpecsTable({ product }) {
  if (!product) return null;
  const rows = SPEC_FIELDS.filter(f => product[f.key]);
  if (!rows.length) return null;

  return (
    <table className="specs-table">
      <tbody>
        {rows.map(f => (
          <tr key={f.key}>
            <td style={{ color:M,fontSize:13,padding:'9px 0',width:'45%',borderBottom:'1px solid var(--color-border)' }}>{f.label}</td>
            <td style={{ color:T,fontSize:13,fontWeight:500,padding:'9px 0',borderBottom:'1px solid var(--color-border)' }}>
              {f.link ? (
                <Link href={`/verify/${product[f.key]}`}
                  style={{ color:'var(--color-accent)',textDecoration:'none' }}
                  onMouseOver={e=>e.currentTarget.style.textDecoration='underline'}
                  onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>
                  {product[f.key]}
                </Link>
              ) : (
                `${product[f.key]}${f.suffix ? f.suffix : ''}`
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}