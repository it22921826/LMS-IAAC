import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UploadCloud, X } from 'lucide-react';

import CardShell from './CardShell';
import {
  fetchFaculties,
  fetchIntakesByProgram,
  fetchProgramsByFaculty,
  fetchSubjectsByIntake,
} from '../services/academics.service';

const lectureSchema = z
  .object({
    facultyId: z.string().min(1, 'Faculty is required'),
    programId: z.string().min(1, 'Program is required'),
    intakeId: z.string().min(1, 'Intake is required'),
    subjectId: z.string().min(1, 'Subject / Level is required'),

    date: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),

    lectureType: z.enum(['physical', 'online'], {
      required_error: 'Lecture type is required',
    }),

    // Optional attachment file (drag & drop or browse).
    attachment: z.any().optional(),
  })
  .refine(
    (values) => {
      // Time inputs are "HH:MM"; lexicographic compare works.
      if (!values.startTime || !values.endTime) return true;
      return values.endTime > values.startTime;
    },
    { path: ['endTime'], message: 'End time must be after start time' }
  );

/**
 * ScheduleLectureForm
 * - Cascading selects (Faculty -> Program -> Intake -> Subject)
 * - Validates required fields with Zod before enabling "Save Lecture"
 * - Drag-and-drop attachment zone with remove
 *
 * Props:
 * - onSave: async (values) => void
 * - defaultValues: partial default form values
 */
export default function ScheduleLectureForm({ onSave, defaultValues }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(lectureSchema),
    mode: 'onChange',
    defaultValues: {
      facultyId: '',
      programId: '',
      intakeId: '',
      subjectId: '',
      date: '',
      startTime: '',
      endTime: '',
      lectureType: 'physical',
      attachment: null,
      ...defaultValues,
    },
  });

  const facultyId = watch('facultyId');
  const programId = watch('programId');
  const intakeId = watch('intakeId');
  const attachment = watch('attachment');

  const [isSaving, setIsSaving] = useState(false);

  // Dropdown options
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Per-dropdown loading states (shown as "Loading..." option)
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingIntakes, setLoadingIntakes] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Drag & drop UI state
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Initial load: faculties
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingFaculties(true);
      try {
        const items = await fetchFaculties();
        if (!cancelled) setFaculties(items);
      } catch {
        if (!cancelled) setFaculties([]);
      } finally {
        if (!cancelled) setLoadingFaculties(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Faculty -> Programs
  useEffect(() => {
    let cancelled = false;

    // Reset downstream fields/options whenever upstream changes.
    setValue('programId', '', { shouldValidate: true });
    setValue('intakeId', '', { shouldValidate: true });
    setValue('subjectId', '', { shouldValidate: true });
    setPrograms([]);
    setIntakes([]);
    setSubjects([]);

    if (!facultyId) return () => {};

    (async () => {
      setLoadingPrograms(true);
      try {
        const items = await fetchProgramsByFaculty(facultyId);
        if (!cancelled) setPrograms(items);
      } catch {
        if (!cancelled) setPrograms([]);
      } finally {
        if (!cancelled) setLoadingPrograms(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [facultyId, setValue]);

  // Program -> Intakes
  useEffect(() => {
    let cancelled = false;

    setValue('intakeId', '', { shouldValidate: true });
    setValue('subjectId', '', { shouldValidate: true });
    setIntakes([]);
    setSubjects([]);

    if (!programId) return () => {};

    (async () => {
      setLoadingIntakes(true);
      try {
        const items = await fetchIntakesByProgram(programId);
        if (!cancelled) setIntakes(items);
      } catch {
        if (!cancelled) setIntakes([]);
      } finally {
        if (!cancelled) setLoadingIntakes(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [programId, setValue]);

  // Intake -> Subjects
  useEffect(() => {
    let cancelled = false;

    setValue('subjectId', '', { shouldValidate: true });
    setSubjects([]);

    if (!intakeId) return () => {};

    (async () => {
      setLoadingSubjects(true);
      try {
        const items = await fetchSubjectsByIntake(intakeId);
        if (!cancelled) setSubjects(items);
      } catch {
        if (!cancelled) setSubjects([]);
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [intakeId, setValue]);

  const selectedFileName = useMemo(() => {
    if (!attachment) return '';
    if (typeof attachment?.name === 'string') return attachment.name;
    return '';
  }, [attachment]);

  function labelFor(items, id) {
    const list = Array.isArray(items) ? items : [];
    const found = list.find((it) => String(it?.id) === String(id));
    return found?.name || '';
  }

  function setAttachment(file) {
    setValue('attachment', file ?? null, { shouldValidate: true });
  }

  function onBrowseClick() {
    fileInputRef.current?.click?.();
  }

  function onFilePicked(e) {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
    // Allow picking same file again.
    e.target.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragActive(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) setAttachment(file);
  }

  async function submit(values) {
    setIsSaving(true);
    try {
      await onSave?.({
        ...values,
        facultyName: labelFor(faculties, values.facultyId),
        programName: labelFor(programs, values.programId),
        intakeName: labelFor(intakes, values.intakeId),
        subjectName: labelFor(subjects, values.subjectId),
      });
    } finally {
      setIsSaving(false);
    }
  }

  function FieldError({ name }) {
    const message = errors?.[name]?.message;
    if (!message) return null;
    return <p className="mt-1 text-xs text-red-600">{String(message)}</p>;
  }

  return (
    <div className="bg-slate-50 p-4 md:p-6">
      <CardShell
        title="Schedule Lecture"
        action={
          <button
            type="submit"
            form="schedule-lecture-form"
            disabled={!isValid || isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Lecture
          </button>
        }
      >
        <form id="schedule-lecture-form" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Column 1: cascading dropdowns */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-800">
                  Faculty <span className="text-red-600">*</span>
                </label>
                <select
                  {...register('facultyId')}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="">Select faculty</option>
                  {loadingFaculties ? <option disabled>Loading...</option> : null}
                  {!loadingFaculties
                    ? faculties.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))
                    : null}
                </select>
                <FieldError name="facultyId" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-800">
                  Program <span className="text-red-600">*</span>
                </label>
                <select
                  {...register('programId')}
                  disabled={!facultyId || loadingPrograms}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50"
                >
                  <option value="">Select program</option>
                  {loadingPrograms ? <option disabled>Loading...</option> : null}
                  {!loadingPrograms
                    ? programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))
                    : null}
                </select>
                <FieldError name="programId" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-800">
                  Intake <span className="text-red-600">*</span>
                </label>
                <select
                  {...register('intakeId')}
                  disabled={!programId || loadingIntakes}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50"
                >
                  <option value="">Select intake</option>
                  {loadingIntakes ? <option disabled>Loading...</option> : null}
                  {!loadingIntakes
                    ? intakes.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))
                    : null}
                </select>
                <FieldError name="intakeId" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-800">
                  Subject / Level <span className="text-red-600">*</span>
                </label>
                <select
                  {...register('subjectId')}
                  disabled={!intakeId || loadingSubjects}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50"
                >
                  <option value="">Select subject</option>
                  {loadingSubjects ? <option disabled>Loading...</option> : null}
                  {!loadingSubjects
                    ? subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))
                    : null}
                </select>
                <FieldError name="subjectId" />
              </div>
            </div>

            {/* Column 2: date/time */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-800">
                  Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  {...register('date')}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
                <FieldError name="date" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-800">
                  Start Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  {...register('startTime')}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
                <FieldError name="startTime" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-800">
                  End Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  {...register('endTime')}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
                <FieldError name="endTime" />
              </div>
            </div>

            {/* Column 3: lecture type + attachment */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Lecture Type <span className="text-red-600">*</span>
                </p>
                <div className="mt-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      value="physical"
                      {...register('lectureType')}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Physical
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      value="online"
                      {...register('lectureType')}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Online
                  </label>
                </div>
                <FieldError name="lectureType" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800">Lecture Attachment</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={onFilePicked}
                />

                <div
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setIsDragActive(true);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={onDrop}
                  className={
                    "mt-2 rounded-xl border border-dashed p-6 text-center " +
                    (isDragActive
                      ? 'border-slate-400 bg-slate-50'
                      : 'border-slate-200 bg-white')
                  }
                >
                  <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-2">
                    <UploadCloud className="h-10 w-10 text-slate-400" />
                    <p className="text-sm font-medium text-slate-800">
                      Drag & Drop your files here
                    </p>
                    <p className="text-xs text-slate-500">OR</p>
                    <button
                      type="button"
                      onClick={onBrowseClick}
                      className="rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white"
                    >
                      Browse Files
                    </button>
                  </div>
                </div>

                {selectedFileName ? (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="truncate text-sm text-slate-800">{selectedFileName}</p>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
                      aria-label="Remove attachment"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </form>
      </CardShell>
    </div>
  );
}
