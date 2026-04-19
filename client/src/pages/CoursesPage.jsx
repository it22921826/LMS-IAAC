import { useEffect, useState } from 'react';
import { apiGet } from '../api/http.js';
import CardShell from '../components/CardShell.jsx';

export default function CoursesPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/courses')
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
        Failed to load courses.
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

  const courses = Array.isArray(data?.courses) ? data.courses : [];

  return (
    <CardShell title="My Courses">
      {courses.length === 0 ? (
        <div className="text-sm text-slate-600">No courses yet.</div>
      ) : (
        <ul className="space-y-4">
          {courses.map((course, idx) => {
            const pct = Number.isFinite(course?.progressPct) ? Math.min(100, Math.max(0, course.progressPct)) : 0;

            return (
              <li key={course.id || idx} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{course.title || '—'}</div>
                    <div className="text-xs text-slate-500">{course.code || ''}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">{pct}%</div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-sky-700"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${course.title || 'Course'} progress`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CardShell>
  );
}
