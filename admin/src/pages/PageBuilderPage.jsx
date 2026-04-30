import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Plus, GripVertical, Eye, EyeOff, Edit2, Trash2, Save, X, ChevronUp, ChevronDown, Layout } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const SECTION_TYPES = [
  { key: 'hero_banner',   label: 'Hero banner',        type: 'Full width' },
  { key: 'featured_grid', label: 'Featured collections', type: '4-col grid' },
  { key: 'new_arrivals',  label: 'New arrivals',        type: 'Carousel' },
  { key: 'why_choose',    label: 'Why choose us',       type: '3-col icons' },
  { key: 'testimonials',  label: 'Testimonials',        type: 'Slider' },
  { key: 'cta_banner',    label: 'CTA banner',          type: 'Full width' },
  { key: 'whatsapp_cta',  label: 'WhatsApp CTA',        type: 'Strip' },
  { key: 'custom_html',   label: 'Custom HTML',         type: 'Freeform' },
];

export default function PageBuilderPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/page-sections', { params: { page: 'homepage' } });
      setSections(res.data.data || []);
    } catch {
      setSections([
        { id: '1', section_key: 'hero_banner', section_type: 'hero_banner', content: { title: 'Welcome to our store', subtitle: 'Discover luxury jewellery' }, is_visible: true, sort_order: 0 },
        { id: '2', section_key: 'featured_grid', section_type: 'featured_grid', content: { heading: 'Featured Collections' }, is_visible: true, sort_order: 1 },
        { id: '3', section_key: 'new_arrivals', section_type: 'new_arrivals', content: { heading: 'New Arrivals' }, is_visible: true, sort_order: 2 },
        { id: '4', section_key: 'why_choose', section_type: 'why_choose', content: { heading: 'Why Choose Us' }, is_visible: true, sort_order: 3 },
        { id: '5', section_key: 'whatsapp_cta', section_type: 'whatsapp_cta', content: { text: 'Chat with us on WhatsApp', phone: '' }, is_visible: true, sort_order: 4 },
        { id: '6', section_key: 'testimonials', section_type: 'testimonials', content: { heading: 'What Our Clients Say' }, is_visible: false, sort_order: 5 },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const moveSection = (idx, dir) => {
    const arr = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    arr.forEach((s, i) => s.sort_order = i);
    setSections(arr);
    toast.success('Section reordered');
  };

  const toggleVisibility = (idx) => {
    const arr = [...sections];
    arr[idx].is_visible = !arr[idx].is_visible;
    setSections(arr);
    toast.success(arr[idx].is_visible ? 'Section visible' : 'Section hidden');
  };

  const deleteSection = (idx) => {
    if (!confirm('Remove this section?')) return;
    const arr = [...sections];
    arr.splice(idx, 1);
    setSections(arr);
    toast.success('Section removed');
  };

  const addSection = (type) => {
    const info = SECTION_TYPES.find(t => t.key === type);
    const newSection = {
      id: `new-${Date.now()}`,
      section_key: type,
      section_type: type,
      content: { heading: info?.label || 'New Section' },
      is_visible: true,
      sort_order: sections.length,
    };
    setSections([...sections, newSection]);
    setAddModal(false);
    toast.success('Section added');
  };

  const handleSaveAll = async () => {
    toast.success('Page layout saved');
  };

  return (
    <>
      <Topbar title="Page builder" subtitle="Homepage layout editor"
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={
          <div className="flex gap-2">
            <button onClick={() => setAddModal(true)} className="btn-outline flex items-center gap-1.5 text-xs">
              <Plus size={13} /> Add section
            </button>
            <button onClick={handleSaveAll} className="btn-gold flex items-center gap-1.5 text-xs">
              <Save size={13} /> Save layout
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-2xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
            </div>
          ) : sections.length === 0 ? (
            <div className="card flex flex-col items-center py-16">
              <Layout size={32} className="text-ink-300 mb-3" />
              <p className="text-sm text-ink-500 mb-4">No sections yet</p>
              <button onClick={() => setAddModal(true)} className="btn-gold text-xs">Add first section</button>
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((s, i) => (
                <div key={s.id} className={`card flex items-center gap-3 px-4 py-3 group transition-all ${!s.is_visible ? 'opacity-50' : ''}`}>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveSection(i, -1)} disabled={i === 0}
                      className="p-0.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400 disabled:opacity-20">
                      <ChevronUp size={12} />
                    </button>
                    <button onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1}
                      className="p-0.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400 disabled:opacity-20">
                      <ChevronDown size={12} />
                    </button>
                  </div>
                  <GripVertical size={14} className="text-ink-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-700 dark:text-ink-200">
                      {s.content?.heading || s.content?.title || SECTION_TYPES.find(t => t.key === s.section_type)?.label || s.section_key}
                    </div>
                    <div className="text-[10px] text-ink-400 mt-0.5">
                      {SECTION_TYPES.find(t => t.key === s.section_type)?.type || s.section_type}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditModal(s)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => toggleVisibility(i)}
                      className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400">
                      {s.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button onClick={() => deleteSection(i)}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add section modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAddModal(false)}>
          <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Add section</h3>
              <button onClick={() => setAddModal(false)} className="p-1 rounded hover:bg-ink-100 text-ink-400"><X size={16} /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {SECTION_TYPES.map(t => (
                <button key={t.key} onClick={() => addSection(t.key)}
                  className="card p-3 hover:border-gold-500 transition-colors text-left">
                  <div className="text-xs font-medium text-ink-700 dark:text-ink-200">{t.label}</div>
                  <div className="text-[10px] text-ink-400 mt-0.5">{t.type}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit section modal */}
      {editModal && (
        <SectionEditor section={editModal} onClose={() => setEditModal(null)}
          onSave={(updated) => {
            setSections(sections.map(s => s.id === updated.id ? updated : s));
            setEditModal(null);
            toast.success('Section updated');
          }}
        />
      )}
    </>
  );
}

function SectionEditor({ section, onClose, onSave }) {
  const [content, setContent] = useState(section.content || {});
  const set = (k, v) => setContent(c => ({ ...c, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
          <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">
            Edit: {SECTION_TYPES.find(t => t.key === section.section_type)?.label || section.section_key}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 text-ink-400"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          {content.title !== undefined && (
            <div>
              <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Title</label>
              <input value={content.title || ''} onChange={e => set('title', e.target.value)} className="input-field" />
            </div>
          )}
          {content.heading !== undefined && (
            <div>
              <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Heading</label>
              <input value={content.heading || ''} onChange={e => set('heading', e.target.value)} className="input-field" />
            </div>
          )}
          {content.subtitle !== undefined && (
            <div>
              <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Subtitle</label>
              <input value={content.subtitle || ''} onChange={e => set('subtitle', e.target.value)} className="input-field" />
            </div>
          )}
          {content.text !== undefined && (
            <div>
              <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Text</label>
              <textarea value={content.text || ''} onChange={e => set('text', e.target.value)} className="input-field min-h-[60px]" />
            </div>
          )}
          {content.phone !== undefined && (
            <div>
              <label className="block text-[11px] font-medium text-ink-500 mb-1.5">WhatsApp number</label>
              <input value={content.phone || ''} onChange={e => set('phone', e.target.value)} className="input-field" placeholder="+971501234567" />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="btn-outline text-xs">Cancel</button>
            <button onClick={() => onSave({ ...section, content })} className="btn-gold flex items-center gap-1.5 text-xs">
              <Save size={13} /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
