import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import DashboardMain from '../components/DashboardMain.jsx';

const STUDENT = {
  name: 'Dilan Augustine',
  firstName: 'Dilan',
  avatarDataUri:
    "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>\n  <defs>\n    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>\n      <stop offset='0' stop-color='%23e2e8f0'/>\n      <stop offset='1' stop-color='%23cbd5e1'/>\n    </linearGradient>\n  </defs>\n  <rect width='96' height='96' rx='48' fill='url(%23g)'/>\n  <circle cx='48' cy='38' r='16' fill='%2394a3b8'/>\n  <path d='M16 88c6-18 20-28 32-28s26 10 32 28' fill='%2394a3b8'/>\n</svg>",
};

export default function StudentDashboard() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('iaac-theme');
    if (stored === 'dark') setIsDark(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('iaac-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const materials = useMemo(
    () => [
      { name: 'Boeing 737 Flight Manual v3.2', type: 'PDF' },
      { name: 'Meteorology Lecture', type: 'Video' },
    ],
    []
  );

  const upcomingClasses = useMemo(
    () => [
      { name: 'Nav 101', when: 'Tuesday 10 AM' },
      { name: 'Air Law', when: 'Wednesday 2 PM' },
    ],
    []
  );

  const news = useMemo(
    () => [
      {
        title: 'IAAC Acquires New Full-Flight Simulator',
        date: 'Apr 12, 2026',
        snippet:
          'A new simulator is now available for advanced training sessions and enhanced procedural practice.',
      },
      {
        title: 'Updated Student Policy: Flight Line Safety',
        date: 'Apr 09, 2026',
        snippet: 'Please review updated guidance before your next on-campus practical session.',
      },
      {
        title: 'Knowledge Hub: New ICAO Chart Pack Released',
        date: 'Apr 06, 2026',
        snippet: 'The latest chart pack is live with updated airspace and approach references.',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <div className="mx-auto grid min-h-screen grid-cols-1 md:grid-cols-[18rem_1fr]">
        <Sidebar student={STUDENT} activeItem="Dashboard" />

        <DashboardMain
          student={STUDENT}
          isDark={isDark}
          onToggleTheme={() => setIsDark((v) => !v)}
          materials={materials}
          upcomingClasses={upcomingClasses}
          news={news}
        />
      </div>
    </div>
  );
}
