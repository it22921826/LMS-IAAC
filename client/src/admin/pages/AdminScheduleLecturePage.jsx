import { useState } from 'react';
import { apiGet, apiPut } from '../../api/http.js';
import ScheduleLectureForm from '../../components/ScheduleLectureForm.jsx';

function makeId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36);
  return `${prefix}-${time}-${rand}`;
}

function toWhen({ date, startTime, endTime }) {
  const d = String(date || '').trim();
  const s = String(startTime || '').trim();
  const e = String(endTime || '').trim();
  if (!d) return '';
  if (!s && !e) return d;
  if (s && e) return `${d} • ${s} - ${e}`;
  return `${d} • ${s || e}`;
}

export default function AdminScheduleLecturePage() {
  const [error, setError] = useState('');

  async function onSave(values) {
    setError('');

    // Persist into AppData `schedule` so the student Schedule page can read it.
    // Note: attachment upload is UI-only right now; we store filename metadata.
    const existing = await apiGet('/api/admin/app-data/schedule').catch(() => null);
    const payload = existing?.payload && typeof existing.payload === 'object' ? existing.payload : { classes: [] };
    const classes = Array.isArray(payload?.classes) ? payload.classes : [];

    const lecture = {
      id: makeId('lecture'),
      name: values.subjectName || values.subjectId || 'Lecture',
      when: toWhen(values),
      location: values.lectureType === 'online' ? 'Online' : 'Physical',
      facultyId: values.facultyId,
      facultyName: values.facultyName || '',
      programId: values.programId,
      programName: values.programName || '',
      intakeId: values.intakeId,
      intakeName: values.intakeName || '',
      subjectId: values.subjectId,
      subjectName: values.subjectName || '',
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      lectureType: values.lectureType,
      attachmentName: values.attachment?.name || '',
    };

    try {
      await apiPut('/api/admin/app-data/schedule', {
        payload: {
          ...(payload || {}),
          classes: [lecture, ...classes],
        },
      });
    } catch (e) {
      setError('Failed to save lecture.');
      throw e;
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
      ) : null}
      <ScheduleLectureForm onSave={onSave} />
    </div>
  );
}
