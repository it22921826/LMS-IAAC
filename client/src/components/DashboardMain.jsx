import { Download, Eye } from 'lucide-react';
import CardShell from './CardShell.jsx';

export default function DashboardMain({
  student,
  materials,
  upcomingClasses,
  news,
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <main className="flex-1">
        <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-8 shadow-sm">
          <span className="absolute left-0 top-6 h-20 w-1.5 rounded-r-full bg-sky-700" aria-hidden="true" />
          <div className="text-2xl font-semibold text-slate-900">
            Welcome to Your Flight Deck, {student.firstName}!
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            Access your study materials, track your course progress, and stay updated on the latest aviation news.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <CardShell title="Course Progress">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">&nbsp;</span>
              <span className="font-semibold text-slate-700">75%</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-sky-700"
                style={{ width: '75%' }}
                role="progressbar"
                aria-valuenow={75}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Course progress"
              />
            </div>
            <div className="mt-3 text-sm text-slate-700">Private Pilot License</div>
          </CardShell>

          <CardShell title="Latest Study Materials">
            <ul className="space-y-4">
              {materials.map((m) => (
                <li key={m.name} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800">
                      {m.name} <span className="text-slate-500">({m.type})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    {m.type !== 'Video' ? (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md p-1 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                        aria-label={`Download ${m.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md p-1 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      aria-label={`View ${m.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </CardShell>

          <CardShell
            title="Upcoming Classes"
            action={
              <a href="#" className="text-xs font-medium text-sky-700 hover:text-sky-800">
                View schedule
              </a>
            }
          >
            <ul className="space-y-4">
              {upcomingClasses.map((c) => (
                <li key={c.name}>
                  <div className="text-sm font-medium text-slate-800">
                    {c.name} - <span className="font-normal text-slate-700">{c.when}</span>
                  </div>
                  <a href="#" className="mt-1 inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-800">
                    See the schedule page
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </CardShell>

          <CardShell title="Knowledge Hub Quick Access">
            <div className="space-y-3">
              <a
                href="#"
                className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-white"
              >
                Flight Checklists
              </a>
              <a
                href="#"
                className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-white"
              >
                ICAO Charts
              </a>
              <a
                href="#"
                className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-white"
              >
                Enroute Reports
              </a>
            </div>
          </CardShell>
        </section>

        <section className="mt-6">
          <CardShell title="Recently Added News">
            <div className="max-h-56 space-y-4 overflow-y-auto pr-2">
              {news.map((n) => (
                <article key={n.title} className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                  <h3 className="text-sm font-semibold text-slate-900">{n.title}</h3>
                  <div className="mt-1 text-xs text-slate-500">
                    {n.date} · Admin
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{n.snippet}</p>
                </article>
              ))}
            </div>
          </CardShell>
        </section>
      </main>
    </div>
  );
}
