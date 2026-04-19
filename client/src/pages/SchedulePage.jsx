import { useEffect, useState } from 'react';
import { apiGet } from '../api/http.js';
import CardShell from '../components/CardShell.jsx';

export default function SchedulePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/schedule')
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
        Failed to load class schedule.
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

  const classes = Array.isArray(data?.classes) ? data.classes : [];

  return (
    <CardShell title="Class Schedule">
      {classes.length === 0 ? (
        <div className="text-sm text-slate-600">No classes scheduled yet.</div>
      ) : (
        <ul className="space-y-3 text-sm">
          {classes.map((c, idx) => (
            <li key={c.id || idx} className="rounded-lg border border-slate-200 p-4">
              <div className="font-semibold text-slate-900">{c.name || '—'}</div>
              <div className="mt-1 text-xs text-slate-500">{c.when || ''}</div>
              <div className="mt-2 text-xs text-slate-700">{c.location || ''}</div>
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  );
}
