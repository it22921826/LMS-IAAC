import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { apiGet } from '../../api/http.js';

export default function LecturerSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    apiGet('/api/schedule')
      .then((d) => setSchedules(Array.isArray(d?.schedules) ? d.schedules : []))
      .catch((e) => setError(e?.message || 'Failed to load schedule'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-slate-500 p-4">Loading…</div>;
  if (error)   return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">My Class Schedule</h2>
      {schedules.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          No classes scheduled yet.
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-semibold text-slate-900">{s.subject}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{s.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.startTime} – {s.endTime}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.room}</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">Batch: {s.batchId}</p>
              {s.notes && <p className="mt-1 text-xs text-slate-600 italic">{s.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
