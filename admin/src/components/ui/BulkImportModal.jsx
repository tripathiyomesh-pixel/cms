/**
 * BulkImportModal — reusable across all modules
 * Usage: <BulkImportModal type="diamond" onClose={fn} onComplete={fn} />
 * Supports: diamond, gemstone, pearl, mounting, jewellery, customer, supplier, category
 */
import { useState, useRef } from 'react';
import { X, Download, Upload, Check, AlertTriangle, FileSpreadsheet, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  diamond:   'Diamonds — 4Cs, cert, Rapaport pricing',
  gemstone:  'Gemstones — origin, treatment, colour quality',
  pearl:     'Pearls — nacre, luster, strand details',
  mounting:  'Mountings — stone compatibility, metal options',
  jewellery: 'Jewellery — metal, weight, making charges',
  customer:  'Customers — name, phone, email',
  supplier:  'Suppliers — company details, terms',
  category:  'Categories — name, parent, sort order',
};

export default function BulkImportModal({ type, onClose, onComplete }) {
  const [step, setStep]         = useState(1);
  const [uploading, setUploading]= useState(false);
  const [importing, setImporting]= useState(false);
  const [preview, setPreview]   = useState(null);
  const [result, setResult]     = useState(null);
  const fileRef = useRef();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  const downloadTemplate = () => window.open(`${API_BASE}/import/template/${type}`, '_blank');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await api.post(`/import/preview/${type}`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      setPreview(r.data.data);
      setStep(3);
    } catch(e) { toast.error(e.response?.data?.message||'Upload failed'); }
    setUploading(false);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!preview?.preview_rows?.length) return;
    setImporting(true);
    try {
      const r = await api.post(`/import/process/${type}`, { job_id: preview?.job_id, rows: preview.preview_rows });
      setResult(r.data.data);
      setStep(4);
      toast.success(r.data.data?.message || 'Import complete');
      if (onComplete) onComplete();
    } catch(e) { toast.error(e.response?.data?.message||'Import failed'); }
    setImporting(false);
  };

  const STEPS = ['Download template','Upload CSV','Preview & confirm','Done'];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={18} className="text-gold-500"/>
            <div>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Bulk import</h3>
              <p className="text-xs text-ink-400">{TYPE_LABELS[type]||type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16}/></button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 px-5 py-3 bg-ink-50 dark:bg-ink-800/50 border-b border-ink-200/60 dark:border-ink-700">
          {STEPS.map((s,i)=>(
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step>i+1?'bg-green-500 text-white':step===i+1?'bg-gold-500 text-white':'bg-ink-200 dark:bg-ink-700 text-ink-400'}`}>
                {step>i+1?<Check size={11}/>:i+1}
              </div>
              <span className={`text-xs hidden sm:block ${step===i+1?'text-gold-600 font-medium':'text-ink-400'}`}>{s}</span>
              {i<3 && <ChevronRight size={11} className="text-ink-300 mx-0.5"/>}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {step===1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-xs text-blue-600 dark:text-blue-400 space-y-1.5">
                <p className="font-medium text-blue-700 dark:text-blue-300 text-sm">Instructions</p>
                <p>1. Download the template CSV file below</p>
                <p>2. Lines starting with # are comments — do not delete the header row</p>
                <p>3. Fill your data from row 4 onwards. Example row is provided.</p>
                <p>4. Save as CSV (comma-separated). Do not use Excel XLSX format.</p>
                <p>5. Maximum 1,000 rows per import batch</p>
              </div>
              <div className="flex items-center justify-between p-4 border border-ink-200 dark:border-ink-700 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-ink-700 dark:text-ink-200">{type}-import-template.csv</p>
                  <p className="text-xs text-ink-400 mt-0.5">Includes headers + example row</p>
                </div>
                <button onClick={downloadTemplate} className="btn-gold flex items-center gap-1.5 text-xs"><Download size={13}/>Download template</button>
              </div>
              <button onClick={()=>setStep(2)} className="w-full btn-gold justify-center py-3">Template ready → Continue to upload</button>
            </div>
          )}

          {step===2 && (
            <div className="space-y-4">
              <div onClick={()=>fileRef.current.click()}
                className="border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-xl p-12 text-center cursor-pointer hover:border-gold-400 transition-colors">
                <Upload size={32} className="mx-auto text-ink-300 mb-3"/>
                <p className="text-sm font-medium text-ink-600 dark:text-ink-300">{uploading?'Validating file…':'Click to select your CSV file'}</p>
                <p className="text-xs text-ink-400 mt-1">CSV only · Max 50MB</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload}/>
              </div>
              <button onClick={()=>setStep(1)} className="btn-ghost text-xs">← Back</button>
            </div>
          )}

          {step===3 && preview && (
            <div className="space-y-4">
              <div className={`rounded-xl p-4 border flex items-start gap-2 ${preview.valid?'bg-green-50 dark:bg-green-900/20 border-green-200':'bg-amber-50 dark:bg-amber-900/20 border-amber-200'}`}>
                {preview.valid?<Check size={15} className="text-green-600 mt-0.5"/>:<AlertTriangle size={15} className="text-amber-600 mt-0.5"/>}
                <div>
                  <p className={`text-sm font-medium ${preview.valid?'text-green-700 dark:text-green-300':'text-amber-700'}`}>
                    {preview.valid?`${preview.total_rows} rows ready to import`:'Column mismatch — review before importing'}
                  </p>
                  {preview.missing_columns?.length>0 && <p className="text-xs text-amber-600 mt-0.5">Missing: {preview.missing_columns.join(', ')}</p>}
                </div>
              </div>

              <div className="border border-ink-200 dark:border-ink-700 rounded-xl overflow-hidden">
                <p className="text-xs font-medium text-ink-500 px-3 py-2 bg-ink-50 dark:bg-ink-800 border-b border-ink-200 dark:border-ink-700">Preview — first {preview.preview_rows?.length} of {preview.total_rows} rows</p>
                <div className="overflow-x-auto max-h-52">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-ink-50 dark:bg-ink-800">
                      <tr>{(preview.columns||[]).slice(0,7).map(c=><th key={c} className="px-3 py-2 text-left font-medium text-ink-500 whitespace-nowrap">{c}</th>)}{preview.columns?.length>7&&<th className="px-3 py-2 text-ink-300">…</th>}</tr>
                    </thead>
                    <tbody>
                      {(preview.preview_rows||[]).map((row,i)=>(
                        <tr key={i} className={`border-t border-ink-100 dark:border-ink-800 ${i%2===0?'':'bg-ink-50/50 dark:bg-ink-800/30'}`}>
                          {(preview.columns||[]).slice(0,7).map(c=><td key={c} className="px-3 py-1.5 text-ink-600 dark:text-ink-300 max-w-[100px] truncate">{row[c]||'—'}</td>)}
                          {preview.columns?.length>7&&<td className="px-3 py-1.5 text-ink-300">…</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="btn-ghost text-xs">← Re-upload</button>
                <button onClick={handleImport} disabled={importing||!preview.valid} className="flex-1 btn-gold justify-center disabled:opacity-50">
                  {importing?<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Importing…</>:<><Upload size={14}/>Import {preview.total_rows} records</>}
                </button>
              </div>
            </div>
          )}

          {step===4 && result && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-green-500"/></div>
              <h3 className="text-lg font-semibold text-ink-700 dark:text-ink-200 mb-4">Import complete</h3>
              <div className="flex justify-center gap-10 mb-6">
                <div><div className="text-3xl font-bold text-green-600">{result.imported}</div><div className="text-xs text-ink-400 mt-1">Imported</div></div>
                <div><div className="text-3xl font-bold text-amber-500">{result.skipped}</div><div className="text-xs text-ink-400 mt-1">Skipped</div></div>
              </div>
              {result.errors?.length>0 && (
                <div className="text-left bg-red-50 dark:bg-red-900/20 rounded-xl p-3 mb-4 max-h-28 overflow-y-auto">
                  {result.errors.map((e,i)=><p key={i} className="text-xs text-red-600 font-mono">Row {e.row}: {e.error}</p>)}
                </div>
              )}
              <button onClick={onClose} className="btn-gold px-10">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
