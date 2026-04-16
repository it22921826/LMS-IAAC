import { useEffect, useState } from 'react';
import { apiGet } from '../api/http.js';
import CardShell from '../components/CardShell.jsx';

function safeHref(href) {
  if (typeof href !== 'string') return '#';
  const v = href.trim();
  if (!v) return '#';
  if (v.startsWith('/') || v.startsWith('#')) return v;
  if (/^https?:\/\//i.test(v)) return v;
  return '#';
}

export default function RecordingsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/recordings')
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
        Failed to load recordings.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
        Loading...
      </div>
    );
  }

  return (
    <CardShell title="Recordings">
      <ul className="space-y-3 text-sm">
        {data.recordings.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-900">{r.title}</div>
              <div className="text-xs text-slate-500">{r.date}</div>
            </div>
            <a
              href={safeHref(r.href)}
              className="flex-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-white"
            >
              Open
            </a>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}
