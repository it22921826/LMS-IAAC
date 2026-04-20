import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * EntityNameDialog
 * Minimal modal for creating/renaming entities (replaces window.prompt).
 *
 * Props:
 * - open: boolean
 * - title: string
 * - label: string
 * - initialValue?: string
 * - confirmLabel?: string
 * - loading?: boolean
 * - error?: string
 * - onClose: () => void
 * - onConfirm: (value: string) => void | Promise<void>
 */
export default function EntityNameDialog({
  open,
  title,
  label,
  initialValue,
  confirmLabel,
  loading,
  error,
  onClose,
  onConfirm,
}) {
  const inputRef = useRef(null);
  const [value, setValue] = useState(initialValue || '');

  useEffect(() => {
    if (!open) return;
    setValue(initialValue || '');
    // Focus after render
    const t = setTimeout(() => inputRef.current?.focus?.(), 0);
    return () => clearTimeout(t);
  }, [open, initialValue]);

  if (!open) return null;

  async function submit() {
    const trimmed = String(value || '').trim();
    if (!trimmed) return;
    await onConfirm?.(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // Click outside closes
        if (e.target === e.currentTarget && !loading) onClose?.();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !loading) onClose?.();
      }}
    >
      <div className="absolute inset-0 bg-slate-900/40" />

      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <div className="text-sm font-bold text-slate-900">{title}</div>
            <div className="mt-1 text-sm text-slate-600">Enter a name to continue.</div>
          </div>
          <button
            type="button"
            onClick={() => (!loading ? onClose?.() : null)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <label className="text-sm font-medium text-slate-800">{label}</label>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
            }}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            placeholder="Type here..."
            disabled={Boolean(loading)}
          />
          {error ? <div className="mt-2 text-sm text-rose-700">{error}</div> : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={() => (!loading ? onClose?.() : null)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={Boolean(loading)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={Boolean(loading) || !String(value || '').trim()}
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : confirmLabel || 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
