import { AlertTriangle, ArrowRight, Bell, CheckCircle2, FileText, Info, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CardShell from './CardShell.jsx';

function NotificationIcon({ type }) {
  const cls = 'h-4 w-4';
  if (type === 'warning') return <AlertTriangle className={cls} />;
  if (type === 'success') return <CheckCircle2 className={cls} />;
  return <Info className={cls} />;
}

function NotificationBadge({ type }) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold';
  if (type === 'warning') return <span className={`${base} bg-amber-50 text-amber-700`}>Alert</span>;
  if (type === 'success') return <span className={`${base} bg-emerald-50 text-emerald-700`}>Update</span>;
  return <span className={`${base} bg-sky-50 text-sky-700`}>Info</span>;
}

function safeInternalTo(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (!v) return null;
  return v.startsWith('/') ? v : null;
}

export default function DashboardMain({ student, progress, notifications, activeMaterial }) {
  const progressPct = Number.isFinite(progress?.progressPct)
    ? Math.min(100, Math.max(0, progress.progressPct))
    : 0;

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const materialType = activeMaterial?.type || 'Material';
  const MaterialIcon = materialType === 'Video' ? PlayCircle : FileText;

  return (
    <div className="flex min-w-0 flex-col">
      <main className="flex-1">
        {/* 1) Dynamic Progress Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-800 via-sky-700 to-indigo-700 p-6 text-white shadow-sm md:p-8">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white/80">Welcome back</div>
              <h1 className="mt-1 text-2xl font-semibold leading-tight md:text-3xl">
                {student?.firstName ? `Ready for takeoff, ${student.firstName}?` : 'Ready for takeoff?'}
              </h1>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                <Bell className="h-4 w-4" />
                <span className="truncate">Current course: {progress?.courseTitle || '—'}</span>
              </div>
              {progress?.nextUp ? (
                <p className="mt-3 max-w-2xl text-sm text-white/85">
                  Next up: <span className="font-semibold text-white">{progress.nextUp}</span>
                </p>
              ) : null}
            </div>

            <div className="w-full max-w-md rounded-2xl bg-white/10 p-5 backdrop-blur">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white/80">Overall progress</div>
                  <div className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">{progressPct}%</div>
                </div>
                <div className="text-right text-xs text-white/80">
                  {Number.isFinite(progress?.completedUnits) && Number.isFinite(progress?.totalUnits) ? (
                    <div>
                      {progress.completedUnits}/{progress.totalUnits} modules
                    </div>
                  ) : (
                    <div>&nbsp;</div>
                  )}
                </div>
              </div>

              <div className="mt-4 h-2 w-full rounded-full bg-white/25">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{ width: `${progressPct}%` }}
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Overall course progress"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white/80">
                <span className="truncate">{progress?.courseCode ? `Code: ${progress.courseCode}` : ''}</span>
                <span className="truncate">{progress?.eta ? `ETA: ${progress.eta}` : ''}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 2) Notification / Alert Center */}
          <CardShell
            title="Notifications & Alerts"
            action={
              <Link to="/policy" className="text-xs font-medium text-sky-700 hover:text-sky-800">
                View policies
              </Link>
            }
          >
            {safeNotifications.length === 0 ? (
              <div className="text-sm text-slate-600">No notifications right now.</div>
            ) : (
              <ul className="space-y-4">
                {safeNotifications.map((n) => {
                  const actionTo = safeInternalTo(n.action?.href);

                  return (
                    <li
                      key={n.id || `${n.title}-${n.date || ''}`}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                            <NotificationIcon type={n.type} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="truncate text-sm font-semibold text-slate-900">{n.title}</div>
                              <NotificationBadge type={n.type} />
                            </div>
                            {n.message ? (
                              <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                            ) : null}
                            {n.date ? <div className="mt-2 text-xs text-slate-500">{n.date}</div> : null}
                          </div>
                        </div>

                        {actionTo && n.action?.label ? (
                          <Link
                            to={actionTo}
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          >
                            {n.action.label}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardShell>

          {/* 3) Active Course Material */}
          <CardShell title="Continue where you left off">
            {!activeMaterial ? (
              <div className="text-sm text-slate-600">No active material yet.</div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <MaterialIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{activeMaterial.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-slate-50 px-2 py-0.5 font-semibold text-slate-700">
                          {activeMaterial.type}
                        </span>
                        {activeMaterial.courseTitle ? <span className="truncate">{activeMaterial.courseTitle}</span> : null}
                        {activeMaterial.lastSeen ? <span>· Last opened {activeMaterial.lastSeen}</span> : null}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={safeInternalTo(activeMaterial.resumeHref) || '/materials'}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-800"
                  >
                    Resume
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {Number.isFinite(activeMaterial.progressPct) ? (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Progress</span>
                      <span className="font-semibold text-slate-800">{activeMaterial.progressPct}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-sky-700"
                        style={{ width: `${Math.min(100, Math.max(0, activeMaterial.progressPct))}%` }}
                        role="progressbar"
                        aria-valuenow={Math.min(100, Math.max(0, activeMaterial.progressPct))}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Active material progress"
                      />
                    </div>
                  </div>
                ) : null}

                {activeMaterial.moduleTitle ? (
                  <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <span className="font-semibold">Up next:</span> {activeMaterial.moduleTitle}
                  </div>
                ) : null}
              </div>
            )}
          </CardShell>
        </section>
      </main>
    </div>
  );
}
