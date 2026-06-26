import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { productsAPI, categoriesAPI, collectionsAPI, pluginsAPI } from '../services/api';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES      = ['draft','active','inactive','archived'];
const METAL_TYPES   = ['gold','silver','platinum','rose_gold','white_gold','palladium'];
const PURITY_OPTIONS= ['24K','22K','18K','14K','950','925','other'];
const CERT_LABS     = ['GIA','IGI','SGL','HRD','AGS'];

export default function ProductFormPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories,  setCategories]  = useState([]);
  const [collections, setCollections] = useState([]);
  const [extData,     setExtData]     = useState({});
  const [saving,      setSaving]      = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', short_description: '',
    // Catalogue
    category_id: '', collection_id: '', status: 'draft',
    // Jewellery specs — always shown for this store
    metal_type: '', purity: '', gross_weight: '', net_weight: '',
    making_charges: '', making_charge_pct: '',
    // Pricing
    base_price: '', discount: '', compare_price: '',
    currency: 'AED',
    // Inventory
    stock_quantity: 0, low_stock_alert: 5,
    // Flags
    is_made_to_order: false, is_featured: false,
    is_new_arrival: false, is_best_seller: false,
    // Certifications
    certifications: [],
    // SEO
    tags: '', seo_title: '', seo_description: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleCert = (lab) => {
    const current = form.certifications || [];
    const exists  = current.some(x => x.body === lab);
    set('certifications', exists
      ? current.filter(x => x.body !== lab)
      : [...current, { body: lab, number: '' }]
    );
  };

  useEffect(() => {
    categoriesAPI.list()
      .then(r => setCategories(r.data.data || []))
      .catch(() => {});

    collectionsAPI.list()
      .then(r => setCollections(r.data.data || []))
      .catch(() => {});

    if (isEdit) {
      productsAPI.get(id).then(r => {
        const p = r.data.data;
        setForm(f => ({
          ...f,
          ...p,
          tags:              Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
          gross_weight:      p.gross_weight      || '',
          net_weight:        p.net_weight        || '',
          base_price:        p.base_price        || '',
          making_charges:    p.making_charges    || '',
          making_charge_pct: p.making_charge_pct || '',
          discount:          p.discount          || '',
          compare_price:     p.compare_price     || '',
          collection_id:     p.collection_id     || '',
          certifications:    p.certifications    || [],
          is_new_arrival:    p.is_new_arrival    || false,
          is_best_seller:    p.is_best_seller    || false,
        }));
      }).catch(() => toast.error('Product not found'));

      pluginsAPI.getProductExtensions(id)
        .then(r => setExtData(r.data.data || {}))
        .catch(() => {});
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        tags:              form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        base_price:        parseFloat(form.base_price)        || 0,
        making_charges:    parseFloat(form.making_charges)    || 0,
        making_charge_pct: parseFloat(form.making_charge_pct) || 0,
        discount:          parseFloat(form.discount)          || 0,
        compare_price:     parseFloat(form.compare_price)     || null,
        stock_quantity:    parseInt(form.stock_quantity)       || 0,
        low_stock_alert:   parseInt(form.low_stock_alert)      || 5,
        gross_weight:      parseFloat(form.gross_weight)       || null,
        net_weight:        parseFloat(form.net_weight)         || null,
        collection_id:     form.collection_id                 || null,
      };
      // Strip falsy jewellery fields rather than sending 0/null
      if (!data.gross_weight) delete data.gross_weight;
      if (!data.net_weight)   delete data.net_weight;
      if (!data.metal_type)   delete data.metal_type;
      if (!data.purity)       delete data.purity;
      if (!data.collection_id) delete data.collection_id;

      let productId = id;
      if (isEdit) {
        await productsAPI.update(id, data);
        toast.success('Product updated');
      } else {
        const res = await productsAPI.create(data);
        productId  = res.data.data.id;
        toast.success('Product created');
      }

      // Save any plugin extension data collected
      for (const [pluginId, extFields] of Object.entries(extData)) {
        if (Object.keys(extFields).length > 0) {
          await pluginsAPI.saveExtension(productId, pluginId, extFields).catch(() => {});
        }
      }

      if (!isEdit) navigate(`/products/${productId}`);
    } catch (err) {
      toast.error(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Save failed'
      );
    }
    setSaving(false);
  };

  const finalPrice =
    (parseFloat(form.base_price)     || 0) +
    (parseFloat(form.making_charges) || 0) -
    (parseFloat(form.discount)       || 0);

  const Field = ({ label, children, full }) => (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <>
      <Topbar
        title={isEdit ? 'Edit product' : 'New product'}
        subtitle={isEdit ? `Editing product #${id}` : 'Add a new product to catalogue'}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate('/products')} className="btn-outline flex items-center gap-1.5 text-xs">
              <ArrowLeft size={13}/> Back
            </button>
            <button onClick={handleSubmit} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50">
              <Save size={13}/> {saving ? 'Saving…' : 'Save product'}
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-5">
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-4">

          {/* ── BASIC INFO ── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Basic information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Product name *" full>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className="input-field"
                  required
                  placeholder="e.g. Solitaire Diamond Ring"
                />
              </Field>

              <Field label="Short description" full>
                <input
                  value={form.short_description}
                  onChange={e => set('short_description', e.target.value)}
                  className="input-field"
                  placeholder="Brief tagline shown on listing"
                />
              </Field>

              <Field label="Description" full>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  className="input-field min-h-[80px]"
                  placeholder="Full product description…"
                />
              </Field>

              <Field label="Category">
                <select
                  value={form.category_id}
                  onChange={e => set('category_id', e.target.value)}
                  className="input-field"
                >
                  <option value="">No category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Collection">
                <select
                  value={form.collection_id}
                  onChange={e => set('collection_id', e.target.value)}
                  className="input-field"
                >
                  <option value="">No collection</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Status">
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  className="input-field"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* ── JEWELLERY SPECIFICATIONS ── always shown for this store ── */}
          <div className="card p-5 border-2 border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">💎 Jewellery specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Metal type">
                <select
                  value={form.metal_type}
                  onChange={e => set('metal_type', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select metal…</option>
                  {METAL_TYPES.map(m => (
                    <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </Field>

              <Field label="Purity / Karat">
                <select
                  value={form.purity}
                  onChange={e => set('purity', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select purity…</option>
                  {PURITY_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>

              <Field label="Gross weight (g)">
                <input
                  type="number"
                  step="0.001"
                  value={form.gross_weight}
                  onChange={e => set('gross_weight', e.target.value)}
                  className="input-field"
                  placeholder="4.200"
                />
              </Field>

              <Field label="Net weight (g)">
                <input
                  type="number"
                  step="0.001"
                  value={form.net_weight}
                  onChange={e => set('net_weight', e.target.value)}
                  className="input-field"
                  placeholder="3.800"
                />
              </Field>

              <Field label="Making charges (flat AED)">
                <input
                  type="number"
                  step="0.01"
                  value={form.making_charges}
                  onChange={e => set('making_charges', e.target.value)}
                  className="input-field"
                  placeholder="500.00"
                />
              </Field>

              <Field label="Making charges (%)">
                <input
                  type="number"
                  step="0.1"
                  value={form.making_charge_pct}
                  onChange={e => set('making_charge_pct', e.target.value)}
                  className="input-field"
                  placeholder="12.5"
                />
              </Field>

              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-2 uppercase tracking-wide">
                  Certifications
                </label>
                <div className="flex flex-wrap gap-2">
                  {CERT_LABS.map(lab => {
                    const active = form.certifications?.some(x => x.body === lab);
                    return (
                      <button
                        key={lab}
                        type="button"
                        onClick={() => toggleCert(lab)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          active
                            ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-300'
                            : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-gold-400'
                        }`}
                      >
                        {lab}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── PRICING ── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Base price">
                <input
                  type="number"
                  step="0.01"
                  value={form.base_price}
                  onChange={e => set('base_price', e.target.value)}
                  className="input-field"
                  placeholder="0.00"
                />
              </Field>

              <Field label="Discount (flat)">
                <input
                  type="number"
                  step="0.01"
                  value={form.discount}
                  onChange={e => set('discount', e.target.value)}
                  className="input-field"
                  placeholder="0.00"
                />
              </Field>

              <Field label="Compare at price">
                <input
                  type="number"
                  step="0.01"
                  value={form.compare_price}
                  onChange={e => set('compare_price', e.target.value)}
                  className="input-field"
                  placeholder="Crossed-out price (optional)"
                />
              </Field>

              <Field label="Currency">
                <select
                  value={form.currency}
                  onChange={e => set('currency', e.target.value)}
                  className="input-field"
                >
                  {['AED','USD','SAR','KWD','QAR','OMR','BHD','INR','GBP','EUR'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Final price (auto-calculated)" full>
                <div className="input-field bg-ink-50 dark:bg-ink-800/50 text-gold-600 dark:text-gold-400 font-semibold cursor-not-allowed">
                  {form.currency}{' '}
                  {finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </Field>
            </div>
          </div>

          {/* ── INVENTORY & FLAGS ── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Inventory & display flags</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Stock quantity">
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={e => set('stock_quantity', e.target.value)}
                  className="input-field"
                  placeholder="0"
                />
              </Field>

              <Field label="Low stock alert threshold">
                <input
                  type="number"
                  value={form.low_stock_alert}
                  onChange={e => set('low_stock_alert', e.target.value)}
                  className="input-field"
                  placeholder="5"
                />
              </Field>

              <Field label="Flags" full>
                <div className="flex flex-wrap items-center gap-6">
                  {[
                    { key: 'is_featured',     label: '⭐ Featured'     },
                    { key: 'is_new_arrival',  label: '✨ New arrival'  },
                    { key: 'is_best_seller',  label: '🔥 Best seller'  },
                    { key: 'is_made_to_order',label: '🔨 Made to order'},
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!form[key]}
                        onChange={e => set(key, e.target.checked)}
                        className="rounded border-ink-300"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* ── SEO & TAGS ── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">SEO and tags</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SEO title">
                <input
                  value={form.seo_title}
                  onChange={e => set('seo_title', e.target.value)}
                  className="input-field"
                  placeholder="Page title for search engines"
                />
              </Field>

              <Field label="Tags (comma separated)">
                <input
                  value={form.tags}
                  onChange={e => set('tags', e.target.value)}
                  className="input-field"
                  placeholder="bridal, solitaire, diamond"
                />
              </Field>

              <Field label="SEO description" full>
                <textarea
                  value={form.seo_description}
                  onChange={e => set('seo_description', e.target.value)}
                  className="input-field min-h-[60px]"
                  placeholder="Meta description for search engines"
                />
              </Field>
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <div className="flex justify-end gap-3 pb-10">
            <button type="button" onClick={() => navigate('/products')} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-gold px-8 disabled:opacity-50">
              {saving ? 'Saving…' : isEdit ? 'Update product' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
