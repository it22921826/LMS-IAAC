import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar.jsx';
import { apiGet } from '../api/http.js';

export default function StudentLayout() {
  const [isDark, setIsDark] = useState(false);
  const [student, setStudent] = useState(null);

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

    apiGet('/api/student/me')
      .then((data) => {
        if (!cancelled) setStudent(data);
      })
      .catch(() => {
        if (!cancelled) setStudent(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <TopNavbar
        student={student}
        isDark={isDark}
        onToggleTheme={() => setIsDark((v) => !v)}
      />

      <main className="mx-auto w-full p-5 md:p-6">
        <Outlet context={{ student }} />
      </main>
    </div>
  );
}
