import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar.jsx';
import { apiGet, apiPost } from '../api/http.js';

export default function StudentLayout() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [student, setStudent] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('iaac-theme');
    if (stored === 'dark') setIsDark(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('iaac-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/auth/me')
      .then((data) => {
        if (!cancelled) setStudent(data);
      })
      .catch((err) => {
        if (!cancelled) setStudent(null);
        if (err?.status === 401) {
          navigate('/login', { replace: true });
        }
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const onLogout = () => {
    apiPost('/api/auth/logout')
      .catch(() => {})
      .finally(() => {
        setStudent(null);
        navigate('/login', { replace: true });
      });
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-sm text-slate-700">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <TopNavbar
        student={student}
        isDark={isDark}
        onToggleTheme={() => setIsDark((v) => !v)}
        onLogout={onLogout}
      />

      <main className="mx-auto w-full p-5 md:p-6">
        <Outlet context={{ student }} />
      </main>
    </div>
  );
}
