import { useEffect, useState } from 'react';
import { apiGet } from '../api/http.js';
import CardShell from '../components/CardShell.jsx';

export default function HelpDeskPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/help')
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
        Failed to load help desk.
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <CardShell title="Help Desk">
        <div className="space-y-2 text-sm text-slate-700">
          <div>
            <span className="font-semibold">Email:</span> {data.contact.email}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {data.contact.phone}
          </div>
          <div>
            <span className="font-semibold">Hours:</span> {data.contact.hours}
          </div>
        </div>
      </CardShell>

      <CardShell title="Recent Tickets">
        <ul className="space-y-3 text-sm">
          {data.tickets.map((t) => (
            <li key={t.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-slate-900">{t.subject}</div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {t.status}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">{t.date}</div>
            </li>
          ))}
        </ul>
      </CardShell>
    </div>
  );
}
