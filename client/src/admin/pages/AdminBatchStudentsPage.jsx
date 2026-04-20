import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet } from '../../api/http.js';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import { fetchEntities } from '../../services/entities.service.js';

export default function AdminBatchStudentsPage() {
  const { programId, intakeId } = useParams();

  const [programs, setPrograms] = useState([]);
  const [intakes, setIntakes] = useState([]);

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadNames() {
      try {
        const facs = await fetchEntities('faculties');
        const allPrograms = [];
        for (const f of facs) {
          // eslint-disable-next-line no-await-in-loop
          const progs = await fetchEntities('programs', f.id);
          allPrograms.push(...progs);
        }
        if (!cancelled) setPrograms(allPrograms);

        const intakeList = await fetchEntities('intakes', programId);
        if (!cancelled) setIntakes(intakeList);
      } catch {
        if (!cancelled) setError('Failed to load hierarchy.');
      }
    }

    loadNames();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  const programName = useMemo(() => {
    const found = programs.find((p) => String(p.id) === String(programId));
    return found?.name || 'Program';
  }, [programs, programId]);

  const intakeName = useMemo(() => {
    const found = intakes.find((i) => String(i.id) === String(intakeId));
    return found?.name || 'Intake';
  }, [intakes, intakeId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    apiGet(`/api/admin/students?intakeId=${encodeURIComponent(String(intakeId))}&limit=200`)
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load students.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [intakeId]);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/admin' },
          { label: 'Faculties', to: '/admin/faculties' },
          { label: 'Programs' },
          { label: programName, to: `/admin/programs/${programId}/intakes` },
          { label: 'Intakes', to: `/admin/programs/${programId}/intakes` },
          { label: intakeName },
          { label: 'Students' },
        ]}
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-bold text-slate-900">Students — {intakeName}</div>

        {loading || !data ? (
          <div className="mt-4 text-sm text-slate-600">Loading…</div>
        ) : data.students.length === 0 ? (
          <div className="mt-4 text-sm text-slate-600">No students registered for this batch yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Student ID</th>
                  <th className="py-2">Course</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.students.map((s) => (
                  <tr key={s.id} className="text-slate-800">
                    <td className="py-3 font-semibold">{s.fullName}</td>
                    <td className="py-3">{s.email}</td>
                    <td className="py-3">{s.studentId}</td>
                    <td className="py-3">{s.course || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
