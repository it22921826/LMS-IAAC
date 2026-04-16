import { useEffect, useState } from 'react';
import { apiGet } from '../../api/http.js';

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    apiGet('/api/admin/metrics')
      .then((json) => {
        if (!cancelled) setMetrics(json);
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
        Failed to load admin dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="absolute left-0 top-6 h-20 w-1.5 rounded-r-full bg-sky-700" aria-hidden="true" />
        <div className="text-xl font-bold text-slate-900">Welcome, Super Admin!</div>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Manage student records, monitor course progress, and publish updates across the portal.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={metrics ? metrics.students : '—'} />
        <StatCard label="Users" value={metrics ? metrics.users : '—'} />
        <StatCard label="Faculties" value={metrics ? metrics.faculties : '—'} />
        <StatCard label="Programmes" value={metrics ? metrics.programmes : '—'} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Income" value={metrics ? metrics.totalIncome : '—'} />
        <StatCard label="Awaiting Payments" value={metrics ? metrics.awaitingPayments : '—'} />
        <StatCard label="Pending Approval" value={metrics ? metrics.pendingApproval : '—'} />
        <StatCard label="Rejected Payments" value={metrics ? metrics.rejectedPayments : '—'} />
      </section>
    </div>
  );
}
