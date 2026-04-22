import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../api/http.js';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function AdminUsersPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const load = () => {
    setLoading(true);
    setError('');
    apiGet('/api/admin/users')
      .then((json) => setData(json))
      .catch((e) => setError(e?.message || 'Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onCreate = (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');

    apiPost('/api/admin/users', form)
      .then(() => {
        setForm({ name: '', email: '', password: '' });
        load();
      })
      .catch((e) => setCreateError(e?.message || 'Failed to create staff user.'))
      .finally(() => setCreating(false));
  };

  const users = Array.isArray(data?.users) ? data.users : [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-bold text-slate-900">Create staff user</div>
        <p className="mt-1 text-sm text-slate-600">Staff can access the admin portal with limited permissions.</p>

        {createError ? (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {createError}
          </div>
        ) : null}

        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={onCreate}>
          <div>
            <label className="text-xs font-semibold text-slate-600">Full name *</label>
            <input
              value={form.name}
              onChange={update('name')}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Email *</label>
            <input
              value={form.email}
              onChange={update('email')}
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Temporary password *</label>
            <input
              value={form.password}
              onChange={update('password')}
              type="password"
              minLength={8}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create staff user'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-bold text-slate-900">Admin users</div>
          <button
            type="button"
            onClick={load}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {error ? <div className="mt-4 text-sm text-rose-700">{error}</div> : null}
        {loading && !data ? <div className="mt-4 text-sm text-slate-600">Loading…</div> : null}

        {data ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="text-slate-800">
                    <td className="py-3 font-semibold">{u.name}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3">{u.role}</td>
                    <td className="py-3 text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 ? <div className="mt-4 text-sm text-slate-600">No users.</div> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
