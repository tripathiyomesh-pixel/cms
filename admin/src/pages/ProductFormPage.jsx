/**
 * ProductFormPage — Universal product form
 *
 * Architecture:
 * - Core fields (name, price, stock, category, status, SEO) always shown
 * - Industry fields (metal/purity for jewellery, size/color for fashion)
 *   are injected dynamically based on which plugins are installed + active
 * - Plugin extension data saved separately via /api/plugins/product/:id/extension
 */
import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { productsAPI, categoriesAPI, pluginsAPI } from '../services/api';
import { Save, ArrowLeft, Puzzle, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['draft','active','inactive','archived'];

// ── Field definitions per plugin ──────────────────────────────
// When a plugin is installed, these field groups appear on the form
const PLUGIN_FIELD_GROUPS = {
  jewellery: {
    label: '💎 Jewellery specifications',
    color: 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10',
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    sections: [
      {
        title: 'Metal',
        fields: [
          { key: 'metal_type', label: 'Metal type', type: 'select', required: true,
            options: ['gold','silver','platinum','rose_gold','white_gold','palladium'].map(v => ({ value: v, label: v.replace('_',' ') })) },
          { key: 'purity', label: 'Purity / Karat', type: 'select', required: true,
            options: ['24K','22K','18K','14K','950','925','other'].map(v => ({ value: v, label: v })) },
          { key: 'gross_weight', label: 'Gross weight (g)', type: 'number', step: '0.001', placeholder: '4.200', required: true },
          { key: 'net_weight',   label: 'Net weight (g)',   type: 'number', step: '0.001', placeholder: '3.800' },
        ]
      },
      {
        title: 'Pricing extras',
        fields: [
          { key: 'making_charges',    label: 'Making charges (flat)', type: 'number', step: '0.01', placeholder: '500.00' },
          { key: 'making_charge_pct', label: 'Making charges (%)',    type: 'number', step: '0.1',  placeholder: '12.5' },
        ]
      },
      {
        title: 'Certifications',
        type: 'certifications',
        options: ['GIA','IGI','SGL','HRD','AGS'],
      },
    ]
  },
};

export default function ProductFormPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories,    setCategories]    = useState([]);
  const [activePlugins, setActivePlugins] = useState([]); // installed + active plugin IDs
  const [extData,       setExtData]       = useState({}); // plugin extension data per plugin_id
  const [saving,        setSaving]        = useState(false);
  const [collapsed2,    setCollapsed2]    = useState({}); // section collapse state

  const [form, setForm] = useState({
    name: '', description: '', short_description: '',
    metal_type: '', purity: '', gross_weight: '', net_weight: '',
    base_price: '', making_charges: '', making_charge_pct: '',
    discount: '', discount_pct: '',
    category_id: '', status: 'draft',
    stock_quantity: 0, low_stock_alert: 5,
    is_made_to_order: false, is_featured: false,
    compare_price: '',
    is_new: false,
    tags: '', certifications: [],
    seo_title: '', seo_description: '',
    currency: 'AED',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setExt = (pluginId, key, val) => setExtData(d => ({ ...d, [pluginId]: { ...(d[pluginId]||{}), [key]: val } }));
  const toggleSection = (key) => setCollapsed2(c => ({ ...c, [key]: !c[key] }));

  useEffect(() => {
    // Load categories
    categoriesAPI.list().then(r => setCategories(r.data.data || [])).catch(()=>{});

    // Load active plugins to know which field groups to show
    pluginsAPI.marketplace().then(r => {
      const installed = (r.data.data || []).filter(p => p.installed && p.is_active);
      setActivePlugins(installed.map(p => p.id));
    }).catch(()=>{});

    // Load existing product + extension data
    if (isEdit) {
      productsAPI.get(id).then(r => {
        const p = r.data.data;
        setForm({
          ...p,
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
          gross_weight:      p.gross_weight      || '',
          net_weight:        p.net_weight        || '',
          base_price:        p.base_price        || '',
          making_charges:    p.making_charges    || '',
          making_charge_pct: p.making_charge_pct || '',
          discount:          p.discount          || '',
        });
      }).catch(() => toast.error('Product not found'));

      // Load plugin extension data
      pluginsAPI.getProductExtensions(id).then(r => {
        setExtData(r.data.data || {});
      }).catch(()=>{});
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [],
        base_price:        parseFloat(form.base_price)        || 0,
        making_charges:    parseFloat(form.making_charges)    || 0,
        making_charge_pct: parseFloat(form.making_charge_pct) || 0,
        discount:          parseFloat(form.discount)          || 0,
        stock_quantity:    parseInt(form.stock_quantity)       || 0,
        low_stock_alert:   parseInt(form.low_stock_alert)      || 5,
      };
      // Only include jewellery fields if values exist
      if (!data.gross_weight) delete data.gross_weight;
      if (!data.net_weight)   delete data.net_weight;
      if (!data.metal_type)   delete data.metal_type;
      if (!data.purity)       delete data.purity;

      let productId = id;
      if (isEdit) {
        await productsAPI.update(id, data);
        toast.success('Product updated');
      } else {
        const res = await productsAPI.create(data);
        productId = res.data.data.id;
        toast.success('Product created');
      }

      // Save plugin extension data
      for (const [pluginId, extFields] of Object.entries(extData)) {
        if (Object.keys(extFields).length > 0) {
          await pluginsAPI.saveExtension(productId, pluginId, extFields).catch(()=>{});
        }
      }

      if (!isEdit) navigate(`/products/${productId}`);
    } catch (e) {
      toast.error(e.response?.data?.errors?.[0]?.msg || e.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  const finalPrice = (parseFloat(form.base_price)||0) + (parseFloat(form.making_charges)||0) - (parseFloat(form.discount)||0);

  const Field = ({ label, children, full, half }) => (
    <div className={full ? 'col-span-2' : half ? '' : ''}>
      <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );

  return (
    <>
      <Topbar
        title={isEdit ? 'Edit product' : 'New product'}
        subtitle={activePlugins.length > 0 ? `Active plugins: ${activePlugins.join(', ')}` : 'No plugins installed — showing universal fields only'}
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate('/products')} className="btn-outline flex items-center gap-1.5 text-xs">
              <ArrowLeft size={13}/> Back
            </button>
            <button onClick={handleSubmit} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50">
              <Save size={13}/> {saving ? 'Saving…' : 'Save product'}
            </button>
          </div>
        }/>

      <div className="flex-1 overflow-y-auto p-5">
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-4">

          {/* ── CORE: Basic info ── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Basic information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Product name *" full>
                <input value={form.name} onChange={e=>set('name',e.target.value)} className="input-field" required placeholder="e.g. Solitaire Diamond Ring"/>
              </Field>
              <Field label="Short description" full>
                <input value={form.short_description} onChange={e=>set('short_description',e.target.value)} className="input-field" placeholder="Brief tagline shown on listing"/>
              </Field>
              <Field label="Description" full>
                <textarea value={form.description} onChange={e=>set('description',e.target.value)} className="input-field min-h-[80px]" placeholder="Full product description…"/>
              </Field>
              <Field label="Category">
                <select value={form.category_id} onChange={e=>set('category_id',e.target.value)} className="input-field">
                  <option value="">No category</option>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={e=>set('status',e.target.value)} className="input-field">
                  {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* ── CORE: Pricing ── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Base price">
                <input type="number" step="0.01" value={form.base_price} onChange={e=>set('base_price',e.target.value)} className="input-field" placeholder="0.00"/>
              </Field>
              <Field label="Discount">
                <input type="number" step="0.01" value={form.discount} onChange={e=>set('discount',e.target.value)} className="input-field" placeholder="0.00"/>
              </Field>
              <Field label="Currency">
                <select value={form.currency} onChange={e=>set('currency',e.target.value)} className="input-field">
                  {['AED','USD','SAR','KWD','QAR','OMR','BHD','INR','GBP','EUR'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Final price (auto-calculated)">
                <div className="input-field bg-ink-50 dark:bg-ink-800/50 text-gold-600 dark:text-gold-400 font-semibold cursor-not-allowed">
                  {form.currency} {finalPrice.toLocaleString(undefined,{minimumFractionDigits:2})}
                </div>
              </Field>
            </div>
          </div>

          {/* ── CORE: Inventory ── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Stock quantity">
                <input type="number" value={form.stock_quantity} onChange={e=>set('stock_quantity',e.target.value)} className="input-field" placeholder="0"/>
              </Field>
              <Field label="Low stock alert threshold">
                <input type="number" value={form.low_stock_alert} onChange={e=>set('low_stock_alert',e.target.value)} className="input-field" placeholder="5"/>
              </Field>
              <Field label="Options" full>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300 cursor-pointer">
                    <input type="checkbox" checked={form.is_made_to_order} onChange={e=>set('is_made_to_order',e.target.checked)} className="rounded border-ink-300"/>
                    Made to order
                  </label>
                  <label className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={e=>set('is_featured',e.target.checked)} className="rounded border-ink-300"/>
                    Featured product
                  </label>
                </div>
              </Field>
            </div>
          </div>

          {/* ── PLUGIN FIELDS — rendered dynamically ── */}
          {activePlugins.length === 0 && (
            <div className="card p-5 border-dashed">
              <div className="flex items-center gap-3">
                <Puzzle size={20} className="text-ink-300"/>
                <div>
                  <p className="text-sm font-medium text-ink-500">No industry plugin installed</p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    Install a plugin from the <button onClick={()=>navigate('/plugins')} className="text-gold-500 hover:underline">Plugin marketplace</button> to add industry-specific fields.
                    Available: Jewellery, Fashion, Real Estate, and more.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activePlugins.map(pluginId => {
            const group = PLUGIN_FIELD_GROUPS[pluginId];
            if (!group) return null; // plugin installed but no frontend fields defined yet

            return (
              <div key={pluginId} className={`card p-5 border-2 ${group.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">{group.label}</h3>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${group.badge}`}>
                      plugin active
                    </span>
                  </div>
                </div>

                {group.sections.map((section, si) => {
                  const sectionKey = `${pluginId}-${si}`;
                  const isCollapsed = collapsed2[sectionKey];

                  return (
                    <div key={si} className="mb-4">
                      <button type="button" onClick={()=>toggleSection(sectionKey)}
                        className="flex items-center justify-between w-full text-xs font-medium text-ink-500 uppercase tracking-wide mb-2 hover:text-ink-700 transition-colors">
                        <span>{section.title}</span>
                        {isCollapsed ? <ChevronDown size={13}/> : <ChevronUp size={13}/>}
                      </button>

                      {!isCollapsed && (
                        <>
                          {/* Regular fields */}
                          {section.fields && (
                            <div className="grid grid-cols-2 gap-4">
                              {section.fields.map(f => {
                                // Jewellery core fields write to main form state
                                const isCore = ['metal_type','purity','gross_weight','net_weight','making_charges','making_charge_pct'].includes(f.key);
                                const value = isCore ? form[f.key] : (extData[pluginId]?.[f.key] || '');
                                const onChange = isCore
                                  ? e => set(f.key, e.target.value)
                                  : e => setExt(pluginId, f.key, e.target.value);

                                return (
                                  <Field key={f.key} label={f.label + (f.required?' *':'')}>
                                    {f.type === 'select' ? (
                                      <select value={value} onChange={onChange} className="input-field" required={f.required}>
                                        <option value="">Select…</option>
                                        {f.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                                      </select>
                                    ) : (
                                      <input type={f.type} step={f.step} value={value} onChange={onChange}
                                        className="input-field" placeholder={f.placeholder} required={f.required}/>
                                    )}
                                  </Field>
                                );
                              })}
                            </div>
                          )}

                          {/* Certification selector */}
                          {section.type === 'certifications' && (
                            <div className="flex flex-wrap gap-2">
                              {section.options.map(c => {
                                const selected = form.certifications?.some(x=>x.body===c);
                                return (
                                  <button key={c} type="button" onClick={()=>{
                                    if (selected) set('certifications', form.certifications.filter(x=>x.body!==c));
                                    else set('certifications', [...(form.certifications||[]),{body:c,number:''}]);
                                  }} className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                    selected
                                      ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-300'
                                      : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-gold-400'
                                  }`}>{c}</button>
                                );
                              })}
                            </div>
                          )}

                          {/* Size tags */}
                          {section.type === 'size_tags' && (
                            <div className="flex flex-wrap gap-2">
                              {section.presets.map(s => {
                                const sizes = extData[pluginId]?.sizes || [];
                                const selected = sizes.includes(s);
                                return (
                                  <button key={s} type="button"
                                    onClick={()=>setExt(pluginId,'sizes',selected?sizes.filter(x=>x!==s):[...sizes,s])}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${selected?'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700':'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-pink-400'}`}>
                                    {s}
                                  </button>
                                );
                              })}
                              <input placeholder="Custom size…" className="input-field w-28 py-1 text-xs"
                                onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();const v=e.target.value.trim();if(v){setExt(pluginId,'sizes',[...(extData[pluginId]?.sizes||[]),v]);e.target.value=''}}}}/>
                            </div>
                          )}

                          {/* Color tags */}
                          {section.type === 'color_tags' && (
                            <div className="flex flex-wrap gap-2 items-center">
                              {(extData[pluginId]?.colors||[]).map(c=>(
                                <span key={c} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-ink-100 dark:bg-ink-800 text-xs text-ink-600">
                                  {c}
                                  <button type="button" onClick={()=>setExt(pluginId,'colors',(extData[pluginId]?.colors||[]).filter(x=>x!==c))} className="text-ink-400 hover:text-red-500">×</button>
                                </span>
                              ))}
                              <input placeholder="Add colour + Enter"className="input-field w-36 py-1 text-xs"
                                onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();const v=e.target.value.trim();if(v){setExt(pluginId,'colors',[...(extData[pluginId]?.colors||[]),v]);e.target.value=''}}}}/>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* ── CORE: SEO & Tags ── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">SEO and tags</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SEO title">
                <input value={form.seo_title} onChange={e=>set('seo_title',e.target.value)} className="input-field" placeholder="Page title for search engines"/>
              </Field>
              <Field label="Tags (comma separated)">
                <input value={form.tags} onChange={e=>set('tags',e.target.value)} className="input-field" placeholder="bridal, solitaire, diamond"/>
              </Field>
              <Field label="SEO description" full>
                <textarea value={form.seo_description} onChange={e=>set('seo_description',e.target.value)} className="input-field min-h-[60px]" placeholder="Meta description for search engines"/>
              </Field>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-10">
            <button type="button" onClick={()=>navigate('/products')} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold px-8 disabled:opacity-50">
              {saving ? 'Saving…' : isEdit ? 'Update product' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
