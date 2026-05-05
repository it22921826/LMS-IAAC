import { useEffect, useRef, useState } from 'react';
import { Video, Plus, Trash2, X, Upload } from 'lucide-react';
import { apiGet, apiDelete } from '../../api/http.js';

const API_BASE = import.meta.env.VITE_API_URL || '';

const TITLE_RE = /^Week \d+\s*[—–-]\s*.+\s*[—–-]\s*Recording$/i;

function validateTitle(t) {
  if (!t || t.trim().length < 5) return 'Title must be at least 5 characters.';
  if (!TITLE_RE.test(t.trim())) return 'Title must follow: "Week N — Topic Name — Recording"';
  return '';
}

export default function LecturerRecordingsPage() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [listErr, setListErr]       = useState('');

  const [showForm, setShowForm]     = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'link'
  const [title, setTitle]           = useState('');
  const [desc, setDesc]             = useState('');
  const [videoLink, setVideoLink]   = useState('');
  const [file, setFile]             = useState(null);
  const [formErr, setFormErr]       = useState('');
  const [uploading, setUploading]   = useState(false);
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true); setListErr('');
    apiGet('/api/recordings/lecturer')
      .then((d) => setRecordings(Array.isArray(d?.recordings) ? d.recordings : []))
      .catch((e) => setListErr(e?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => { setTitle(''); setDesc(''); setVideoLink(''); setFile(null); setFormErr(''); if (fileRef.current) fileRef.current.value = ''; };

  const onUpload = async (e) => {
    e.preventDefault();
    const titleErr = validateTitle(title);
    if (titleErr) { setFormErr(titleErr); return; }
    if (uploadMode === 'file' && !file) { setFormErr('Please select a video file.'); return; }
    if (uploadMode === 'link' && !videoLink.trim()) { setFormErr('Please enter a video URL.'); return; }

    setFormErr(''); setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', desc.trim());
      if (uploadMode === 'file') fd.append('video', file);
      else fd.append('videoLink', videoLink.trim());

      const res = await fetch(`${API_BASE}/api/recordings/lecturer`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || `Upload failed (${res.status})`);
      }
      resetForm(); setShowForm(false); load();
    } catch (err) {
      setFormErr(err?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this recording?')) return;
    try { await apiDelete(`/api/recordings/lecturer/${id}`); load(); }
    catch (err) { alert(err?.message || 'Failed to delete'); }
  };

  const inputCls = 'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Lecture Recordings</h2>
        <button onClick={() => { setShowForm((v) => !v); resetForm(); }} className="flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900">
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Upload Recording</>}
        </button>
      </div>

      {showForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 mb-1">Title format: <code className="text-slate-700">Week N — Topic Name — Recording</code></p>
          {formErr && <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{formErr}</div>}
          <form className="space-y-3" onSubmit={onUpload}>
            <div>
              <label className="text-xs font-semibold text-slate-600">Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={`mt-1 ${inputCls}`} required placeholder="Week 1 — Air Law — Recording" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Description (optional)</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className={`mt-1 ${inputCls} resize-none`} rows={2} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setUploadMode('file')} className={`rounded-xl px-4 py-2 text-xs font-semibold ${uploadMode === 'file' ? 'bg-sky-700 text-white' : 'border border-slate-300 text-slate-700'}`}>Upload File</button>
              <button type="button" onClick={() => setUploadMode('link')} className={`rounded-xl px-4 py-2 text-xs font-semibold ${uploadMode === 'link' ? 'bg-sky-700 text-white' : 'border border-slate-300 text-slate-700'}`}>Video Link</button>
            </div>
            {uploadMode === 'file' ? (
              <div>
                <label className="text-xs font-semibold text-slate-600">Video file *</label>
                <input ref={fileRef} type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0] || null)} className="mt-1 block w-full text-xs text-slate-600" />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-600">YouTube / Vimeo URL *</label>
                <input value={videoLink} onChange={(e) => setVideoLink(e.target.value)} className={`mt-1 ${inputCls}`} placeholder="https://youtube.com/watch?v=..." />
              </div>
            )}
            <button type="submit" disabled={uploading} className="flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60">
              <Upload size={14} />{uploading ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {listErr && <div className="text-sm text-rose-700 mb-3">{listErr}</div>}
        {loading ? <div className="text-sm text-slate-500">Loading…</div> : recordings.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-8">You have not uploaded any recordings yet.</div>
        ) : (
          <div className="space-y-3">
            {recordings.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Video size={16} /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{r.title}</p>
                    <p className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <button onClick={() => onDelete(r.id)} className="h-8 w-8 flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-100"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
