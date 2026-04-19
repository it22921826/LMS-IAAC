import { useEffect, useState } from 'react';
import { apiGet } from '../api/http.js';
import CardShell from '../components/CardShell.jsx';

export default function PolicyPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/policy')
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
        Failed to load student policy.
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

  const sections = Array.isArray(data?.sections) ? data.sections : [];

  return (
    <CardShell title="Student Policy">
      {sections.length === 0 ? (
        <div className="text-sm text-slate-600">No policy content yet.</div>
      ) : (
        <div className="space-y-4">
          {sections.map((s, idx) => (
            <section key={s.id || idx} className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{s.title || '—'}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.body || ''}</p>
            </section>
          ))}
        </div>
      )}
    </CardShell>
  );
}
