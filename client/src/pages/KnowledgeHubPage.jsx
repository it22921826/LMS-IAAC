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

export default function KnowledgeHubPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/knowledge-hub')
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
        Failed to load knowledge hub.
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
    <CardShell title="Knowledge Hub">
      <div className="space-y-3">
        {data.items.map((item) => (
          <a
            key={item.id}
            href={safeHref(item.href)}
            className="block rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-white"
          >
            {item.title}
          </a>
        ))}
      </div>
    </CardShell>
  );
}
