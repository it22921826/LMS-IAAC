import { useEffect, useState } from 'react';
import { apiGet } from '../api/http.js';
import CardShell from '../components/CardShell.jsx';

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 last:border-b-0">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="min-w-0 truncate text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/profile')
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
        Failed to load profile.
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
    <CardShell title="Profile">
      <div className="flex items-center gap-4">
        {data.profile.avatarDataUri ? (
          <img
            src={data.profile.avatarDataUri}
            alt={data.profile.name}
            className="h-14 w-14 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-full border border-slate-200 bg-slate-100" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-slate-900">{data.profile.name}</div>
          <div className="text-sm text-slate-600">{data.profile.program}</div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 px-4">
        <Row label="Student ID" value={data.profile.studentId} />
        <Row label="Email" value={data.profile.email} />
        <Row label="Phone" value={data.profile.phone} />
        <Row label="Cohort" value={data.profile.cohort} />
      </div>
    </CardShell>
  );
}
