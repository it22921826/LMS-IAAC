import { useEffect, useState } from 'react';
import { apiGet } from '../api/http.js';
import CardShell from '../components/CardShell.jsx';

export default function ResultsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/results')
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
        Failed to load exam results.
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

  const results = Array.isArray(data?.results) ? data.results : [];

  return (
    <CardShell title="Exam Results">
      {results.length === 0 ? (
        <div className="text-sm text-slate-600">No results yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2">Exam</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={r.id || idx} className="border-t border-slate-200">
                  <td className="px-3 py-2 font-medium text-slate-900">{r.exam || '—'}</td>
                  <td className="px-3 py-2 text-slate-700">{r.date || ''}</td>
                  <td className="px-3 py-2 text-slate-700">{r.score || ''}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {r.status || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardShell>
  );
}
