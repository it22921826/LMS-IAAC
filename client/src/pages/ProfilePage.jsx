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

  const profile = data && typeof data.profile === 'object' ? data.profile : {};

  const safeRow = (value) => {
    if (typeof value === 'string') return value.trim() ? value : '—';
    if (value === null || value === undefined) return '—';
    return String(value);
  };

  return (
    <CardShell title="Profile">
      <div className="flex items-center gap-4">
        {profile.avatarDataUri ? (
          <img
            src={profile.avatarDataUri}
            alt={profile.name || 'Profile'}
            className="h-14 w-14 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-full border border-slate-200 bg-slate-100" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-slate-900">{profile.name || '—'}</div>
          <div className="text-sm text-slate-600">{profile.program || ''}</div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 px-4">
        <Row label="Student ID" value={safeRow(profile.studentId)} />
        <Row label="Email" value={safeRow(profile.email)} />
        <Row label="Phone" value={safeRow(profile.phone)} />
        <Row label="Cohort" value={safeRow(profile.cohort)} />
      </div>
    </CardShell>
  );
}
