import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Upload, FileSpreadsheet, Check, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const RAPNET_FIELDS = ['Shape','Weight','Color','Clarity','Cut','Polish','Symmetry','Fluorescence Intensity','Lab','Certificate #','Depth %','Table %','Measurement','Rap Price','Disc %','Price/Ct','Total Price'];

const FIELD_MAPPING = {
  diamond: [
    {from:'Shape',to:'shape'},{from:'Weight',to:'carat'},{from:'Color',to:'color'},
    {from:'Clarity',to:'clarity'},{from:'Cut',to:'cut'},{from:'Polish',to:'polish'},
    {from:'Symmetry',to:'symmetry'},{from:'Fluorescence Intensity',to:'fluorescence'},
    {from:'Lab',to:'primary_cert_lab'},{from:'Certificate #',to:'primary_cert_no'},
    {from:'Disc %',to:'rap_discount_pct'},{from:'Total Price',to:'final_price'},
  ],
  gemstone:[
    {from:'Type',to:'gemstone_type'},{from:'Weight',to:'carat'},{from:'Origin',to:'country_of_origin'},
    {from:'Treatment',to:'treatment'},{from:'Shape',to:'shape'},{from:'Color',to:'color_description'},
  ],
  jewellery:[
    {from:'Name',to:'name'},{from:'Metal',to:'metal_type'},{from:'Purity',to:'purity'},
    {from:'Gross Weight',to:'gross_weight'},{from:'Price',to:'final_price'},
  ],
};

export default function ImportEnginePage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [step, setStep]         = useState(1); // 1:upload 2:map 3:confirm
  const [jobs, setJobs]         = useState([]);
  const [preview, setPreview]   = useState(null);
  const [importType, setImportType] = useState('diamond');
  const [uploading, setUploading]   = useState(false);
  const [mapping, setMapping]       = useState({});
  const fileRef = useRef();

  const loadJobs = async () => {
    try { const r=await api.get('/import/jobs'); setJobs(r.data.data||[]); } catch {}
  };
  useEffect(()=>{ loadJobs(); },[]);

  const handleFile = async(e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('import_type', importType);
      const r = await api.post('/import/preview', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      setPreview(r.data.data);
      // Auto-map fields
      const autoMap = {};
      const suggested = FIELD_MAPPING[importType] || [];
      suggested.forEach(({from,to}) => {
        if (r.data.data.columns.includes(from)) autoMap[from] = to;
      });
      setMapping(autoMap);
      setStep(2);
    } catch(e) { toast.error(e.response?.data?.message||'Upload failed'); }
    setUploading(false);
    e.target.value = '';
  };

  const STATUS_COLORS = { PENDING:'text-amber-600 bg-amber-50', PROCESSING:'text-blue-600 bg-blue-50', DONE:'text-green-600 bg-green-50', FAILED:'text-red-600 bg-red-50' };

  return (
    <>
      <Topbar title="Import engine" subtitle="Bulk import diamonds, gemstones, jewellery via CSV"
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={<button onClick={loadJobs} className="btn-outline flex items-center gap-1.5 text-xs"><RefreshCw size={13}/>Refresh jobs</button>}/>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Template download */}
        <div className="card p-4">
          <p className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-3">Download templates</p>
          <div className="flex gap-3 flex-wrap">
            {[
              {label:'RapNet diamonds CSV',type:'rapnet', cols:RAPNET_FIELDS},
              {label:'Gemstone template',type:'gemstone', cols:['Type','Weight','Origin','Treatment','Shape','Color','Price']},
              {label:'Jewellery template',type:'jewellery', cols:['Name','Metal','Purity','Gross Weight','Price','Status']},
            ].map(t=>(
              <button key={t.type} onClick={()=>{
                const csv=t.cols.join(',')+'\n';
                const blob=new Blob([csv],{type:'text/csv'});
                const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
                a.download=`${t.type}-template.csv`; a.click();
              }} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ink-200 dark:border-ink-700 text-xs text-ink-500 hover:border-gold-400 hover:text-gold-600 transition-colors">
                <Download size={13}/>{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload area */}
        <div className="card p-5">
          <div className="flex items-center gap-4 mb-4">
            <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Import type</p>
            <div className="flex gap-2">
              {['diamond','gemstone','pearl','jewellery','mounting'].map(t=>(
                <button key={t} onClick={()=>setImportType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${importType===t?'bg-gold-500 text-white border-gold-500':'border-ink-200 dark:border-ink-700 text-ink-500'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {step===1 && (
            <div onClick={()=>fileRef.current.click()}
              className="border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-xl p-12 text-center cursor-pointer hover:border-gold-400 transition-colors">
              <FileSpreadsheet size={32} className="mx-auto text-ink-300 mb-3"/>
              <p className="text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">{uploading?'Uploading…':'Drop CSV file here or click to browse'}</p>
              <p className="text-xs text-ink-400">CSV files up to 50MB · Max ~10,000 rows</p>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile}/>
            </div>
          )}

          {step===2 && preview && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Check size={14} className="text-green-600"/></div>
                <div>
                  <p className="text-sm font-medium text-ink-700 dark:text-ink-200">File uploaded — {preview.total_rows} rows detected</p>
                  <p className="text-xs text-ink-400">Auto-detected as: {preview.detected_type} · Job ID: {preview.job_id}</p>
                </div>
              </div>

              {/* Column mapping */}
              <div>
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">Column mapping (CSV → system field)</p>
                <div className="grid grid-cols-2 gap-2">
                  {preview.columns.map(col=>(
                    <div key={col} className="flex items-center gap-2 p-2 bg-ink-50 dark:bg-ink-800 rounded-lg text-xs">
                      <span className="font-mono text-ink-600 dark:text-ink-300 min-w-[100px] truncate">{col}</span>
                      <span className="text-ink-400">→</span>
                      <input value={mapping[col]||''} onChange={e=>setMapping(m=>({...m,[col]:e.target.value}))}
                        className="flex-1 bg-white dark:bg-ink-700 border border-ink-200 dark:border-ink-600 rounded px-2 py-1 text-xs text-ink-600 dark:text-ink-300"
                        placeholder="skip"/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview rows */}
              {preview.preview_rows?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">Preview (first 5 rows)</p>
                  <div className="overflow-x-auto rounded-lg border border-ink-200 dark:border-ink-700">
                    <table className="w-full text-[10px]">
                      <thead><tr className="bg-ink-50 dark:bg-ink-800">{preview.columns.slice(0,8).map(c=><th key={c} className="px-3 py-2 text-left text-ink-500 font-medium whitespace-nowrap">{c}</th>)}</tr></thead>
                      <tbody>
                        {preview.preview_rows.slice(0,5).map((row,i)=>(
                          <tr key={i} className="border-t border-ink-100 dark:border-ink-800">
                            {preview.columns.slice(0,8).map(c=><td key={c} className="px-3 py-1.5 text-ink-600 dark:text-ink-300 whitespace-nowrap max-w-[100px] truncate">{row[c]||'—'}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button onClick={()=>{setStep(1);setPreview(null);}} className="btn-outline text-xs">Start over</button>
                <button onClick={()=>{ toast.success('Import queued — processing in background'); setStep(1); setPreview(null); loadJobs(); }}
                  className="btn-gold text-xs flex items-center gap-1.5"><Upload size={13}/>Start import</button>
              </div>
            </div>
          )}
        </div>

        {/* Import job history */}
        {jobs.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-200/60 dark:border-ink-700">
              <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Import history</p>
            </div>
            {jobs.map((job,i)=>(
              <div key={job.id} className={`flex items-center gap-4 px-4 py-3 text-xs ${i%2===0?'':'bg-ink-50/50 dark:bg-ink-800/30'} ${i<jobs.length-1?'border-b border-ink-100 dark:border-ink-800':''}`}>
                <div className="flex-1">
                  <p className="font-medium text-ink-700 dark:text-ink-200">{job.filename||job.import_type}</p>
                  <p className="text-ink-400">{job.import_type} · {new Date(job.created_at).toLocaleDateString('en-AE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
                </div>
                <div className="text-right text-ink-400">
                  <p>{job.imported||0} imported · {job.skipped||0} skipped · {job.errors||0} errors</p>
                  <p className="text-ink-300">Total: {job.total_rows||0} rows</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[job.status]||'bg-ink-100 text-ink-500'}`}>{job.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
