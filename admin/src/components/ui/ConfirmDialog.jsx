import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-ink-800 rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200">
          <X size={16} />
        </button>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gold-50 dark:bg-gold-900/20'}`}>
          <AlertTriangle size={18} className={danger ? 'text-red-500' : 'text-gold-500'} />
        </div>
        <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-2">{title}</h3>
        {message && <p className="text-xs text-ink-500 dark:text-ink-400 mb-5">{message}</p>}
        <div className="flex gap-2 justify-end">
          <button ref={cancelRef} onClick={onCancel} className="btn-ghost text-sm px-4 py-2 border border-ink-200 dark:border-ink-600 rounded-lg">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-gold-500 hover:bg-gold-600'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
