import { useEffect, useState } from 'react';
import { apiGet } from '../api/http.js';
import CardShell from '../components/CardShell.jsx';

export default function MaterialsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/materials')
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
        Failed to load study materials.
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

  const materials = Array.isArray(data?.materials) ? data.materials : [];

  return (
    <CardShell title="Study Materials">
      {materials.length === 0 ? (
        <div className="text-sm text-slate-600">No materials yet.</div>
      ) : (
        <ul className="space-y-3 text-sm">
          {materials.map((m, idx) => (
            <li
              key={m.id || idx}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-900">{m.name || '—'}</div>
                <div className="text-xs text-slate-500">{m.type || ''}</div>
              </div>
              <div className="text-xs font-semibold text-slate-700">{m.visibility || ''}</div>
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  );
}
