import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { productsAPI, categoriesAPI } from '../services/api';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const METALS = ['gold','silver','platinum','rose_gold','white_gold','palladium'];
const PURITIES = ['24K','22K','18K','14K','950','925','other'];
const STATUSES = ['draft','active','inactive','archived'];
const CERTS = ['GIA','IGI','SGL','HRD','AGS'];

export default function ProductFormPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', short_description: '',
    metal_type: 'gold', purity: '18K', gross_weight: '', net_weight: '',
    base_price: '', making_charges: '', making_charge_pct: '', discount: '', discount_pct: '',
    category_id: '', status: 'draft', stock_quantity: 0, is_made_to_order: false,
    is_featured: false, tags: '', certifications: [], gemstone_details: [],
    seo_title: '', seo_description: '',
  });

  useEffect(() => {
    categoriesAPI.list().then(r => setCategories(r.data.data || [])).catch(() => {});
    if (isEdit) {
      productsAPI.get(id).then(r => {
        const p = r.data.data;
        setForm({
          ...p,
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
          gross_weight: p.gross_weight || '',
          net_weight: p.net_weight || '',
          base_price: p.base_price || '',
          making_charges: p.making_charges || '',
          discount: p.discount || '',
        });
      }).catch(() => toast.error('Product not found'));
    }
  }, [id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        gross_weight: parseFloat(form.gross_weight) || 0,
        net_weight: parseFloat(form.net_weight) || undefined,
        base_price: parseFloat(form.base_price) || 0,
        making_charges: parseFloat(form.making_charges) || 0,
        discount: parseFloat(form.discount) || 0,
        stock_quantity: parseInt(form.stock_quantity) || 0,
      };
      if (isEdit) {
        await productsAPI.update(id, data);
        toast.success('Product updated');
      } else {
        const res = await productsAPI.create(data);
        toast.success('Product created');
        navigate(`/products/${res.data.data.id}`);
      }
    } catch (e) {
      const msg = e.response?.data?.errors?.[0]?.msg || e.response?.data?.message || 'Save failed';
      toast.error(msg);
    }
    setSaving(false);
  };

  const Field = ({ label, children, full }) => (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 tracking-wide">{label}</label>
      {children}
    </div>
  );

  return (
    <>
      <Topbar
        title={isEdit ? 'Edit product' : 'New product'}
        collapsed={collapsed}
        onToggle={toggleSidebar}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate('/products')} className="btn-outline flex items-center gap-1.5 text-xs">
              <ArrowLeft size={13} /> Back
            </button>
            <button onClick={handleSubmit} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50">
              <Save size={13} /> {saving ? 'Saving...' : 'Save product'}
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-5">
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">

          {/* Basic Info */}
          <div className="card p-5">
            <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-4">Basic information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Product name" full>
                <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" required placeholder="Solitaire Diamond Ring" />
              </Field>
              <Field label="Short description" full>
                <input value={form.short_description} onChange={e => set('short_description', e.target.value)} className="input-field" placeholder="Brief tagline" />
              </Field>
              <Field label="Description" full>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input-field min-h-[80px]" placeholder="Full product description..." />
              </Field>
              <Field label="Category">
                <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className="input-field">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={e => set('status', e.target.value)} className="input-field">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Metal & Weight */}
          <div className="card p-5">
            <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-4">Metal and weight</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Metal type">
                <select value={form.metal_type} onChange={e => set('metal_type', e.target.value)} className="input-field" required>
                  {METALS.map(m => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
                </select>
              </Field>
              <Field label="Purity / Karat">
                <select value={form.purity} onChange={e => set('purity', e.target.value)} className="input-field" required>
                  {PURITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Gross weight (g)">
                <input type="number" step="0.001" value={form.gross_weight} onChange={e => set('gross_weight', e.target.value)} className="input-field" required placeholder="4.200" />
              </Field>
              <Field label="Net weight (g)">
                <input type="number" step="0.001" value={form.net_weight} onChange={e => set('net_weight', e.target.value)} className="input-field" placeholder="3.800" />
              </Field>
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-5">
            <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-4">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Base price">
                <input type="number" step="0.01" value={form.base_price} onChange={e => set('base_price', e.target.value)} className="input-field" required placeholder="5000.00" />
              </Field>
              <Field label="Making charges">
                <input type="number" step="0.01" value={form.making_charges} onChange={e => set('making_charges', e.target.value)} className="input-field" placeholder="500.00" />
              </Field>
              <Field label="Discount">
                <input type="number" step="0.01" value={form.discount} onChange={e => set('discount', e.target.value)} className="input-field" placeholder="200.00" />
              </Field>
              <Field label="Final price (auto-calculated)">
                <div className="input-field bg-ink-50 dark:bg-ink-800/50 text-ink-500 cursor-not-allowed">
                  {((parseFloat(form.base_price) || 0) + (parseFloat(form.making_charges) || 0) - (parseFloat(form.discount) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </Field>
            </div>
          </div>

          {/* Inventory */}
          <div className="card p-5">
            <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-4">Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Stock quantity">
                <input type="number" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} className="input-field" placeholder="0" />
              </Field>
              <Field label="Options">
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300 cursor-pointer">
                    <input type="checkbox" checked={form.is_made_to_order} onChange={e => set('is_made_to_order', e.target.checked)} className="rounded border-ink-300" />
                    Made to order
                  </label>
                  <label className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="rounded border-ink-300" />
                    Featured product
                  </label>
                </div>
              </Field>
            </div>
          </div>

          {/* Certifications */}
          <div className="card p-5">
            <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-4">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {CERTS.map(c => {
                const selected = form.certifications?.some(x => x.body === c);
                return (
                  <button key={c} type="button" onClick={() => {
                    if (selected) set('certifications', form.certifications.filter(x => x.body !== c));
                    else set('certifications', [...(form.certifications || []), { body: c, number: '' }]);
                  }} className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                    selected ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-300'
                    : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-gold-400'
                  }`}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEO & Tags */}
          <div className="card p-5">
            <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-4">SEO and tags</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SEO title">
                <input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} className="input-field" placeholder="SEO page title" />
              </Field>
              <Field label="Tags (comma separated)">
                <input value={form.tags} onChange={e => set('tags', e.target.value)} className="input-field" placeholder="bridal, solitaire, diamond" />
              </Field>
              <Field label="SEO description" full>
                <textarea value={form.seo_description} onChange={e => set('seo_description', e.target.value)} className="input-field min-h-[60px]" placeholder="Meta description for search engines" />
              </Field>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-10">
            <button type="button" onClick={() => navigate('/products')} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold px-8 disabled:opacity-50">
              {saving ? 'Saving...' : isEdit ? 'Update product' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
