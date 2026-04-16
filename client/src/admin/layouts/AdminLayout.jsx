import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../api/http.js';
import AdminSidebar from '../components/AdminSidebar.jsx';
import AdminTopbar from '../components/AdminTopbar.jsx';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/admin/auth/me')
      .then((data) => {
        if (!cancelled) setAdmin(data);
      })
      .catch(() => {
        if (!cancelled) setAdmin(null);
        navigate('/admin/login', { replace: true });
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const onLogout = () => {
    apiPost('/api/admin/auth/logout')
      .catch(() => {})
      .finally(() => {
        setAdmin(null);
        navigate('/admin/login', { replace: true });
      });
  };

  if (!checked) {
    return <div className="min-h-screen bg-slate-50 p-6 text-sm text-slate-700">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar admin={admin} />
        <div className="min-w-0 flex-1">
          <AdminTopbar admin={admin} onLogout={onLogout} />
          <main className="p-5 md:p-6">
            <Outlet context={{ admin }} />
          </main>
        </div>
      </div>
    </div>
  );
}
