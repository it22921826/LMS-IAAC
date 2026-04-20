import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiGet, apiPut } from '../../api/http.js';

function prettyJson(value) {
  return JSON.stringify(value, null, 2);
}

function makeId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36);
  return `${prefix}-${time}-${rand}`;
}

function Field({ label, children, hint }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-semibold text-slate-600">{label}</label>
        {hint ? <div className="text-[11px] text-slate-400">{hint}</div> : null}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={
        'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ' +
        (props.className || '')
      }
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={
        'w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ' +
        (props.className || '')
      }
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={
        'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ' +
        (props.className || '')
      }
    />
  );
}

function Section({ title, children, action }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-slate-900">{title}</div>
        {action || null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function updateArrayItem(prev, key, idx, patch) {
  const base = prev && typeof prev === 'object' ? prev : {};
  const arr = Array.isArray(base[key]) ? base[key] : [];
  return {
    ...base,
    [key]: arr.map((it, i) => (i === idx ? { ...(it || {}), ...patch } : it)),
  };
}

function removeArrayItem(prev, key, idx) {
  const base = prev && typeof prev === 'object' ? prev : {};
  const arr = Array.isArray(base[key]) ? base[key] : [];
  return {
    ...base,
    [key]: arr.filter((_, i) => i !== idx),
  };
}

function addArrayItem(prev, key, item) {
  const base = prev && typeof prev === 'object' ? prev : {};
  const arr = Array.isArray(base[key]) ? base[key] : [];
  return {
    ...base,
    [key]: [...arr, item],
  };
}

function DashboardEditor({ draft, setDraft }) {
  const progress = draft?.progress && typeof draft.progress === 'object' ? draft.progress : {};
  const notifications = Array.isArray(draft?.notifications) ? draft.notifications : [];
  const active = draft?.activeMaterial && typeof draft.activeMaterial === 'object' ? draft.activeMaterial : {};

  return (
    <div className="space-y-6">
      <Section title="Progress hero">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Course code">
            <TextInput
              value={progress.courseCode || ''}
              onChange={(e) =>
                setDraft((p) => ({
                  ...(p || {}),
                  progress: { ...progress, courseCode: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Course title">
            <TextInput
              value={progress.courseTitle || ''}
              onChange={(e) =>
                setDraft((p) => ({
                  ...(p || {}),
                  progress: { ...progress, courseTitle: e.target.value },
                }))
              }
            />
          </Field>

          <Field label="Progress %" hint="0–100">
            <TextInput
              type="number"
              min={0}
              max={100}
              value={Number.isFinite(progress.progressPct) ? progress.progressPct : 0}
              onChange={(e) =>
                setDraft((p) => ({
                  ...(p || {}),
                  progress: { ...progress, progressPct: Number(e.target.value) },
                }))
              }
            />
          </Field>
          <Field label="ETA">
            <TextInput
              value={progress.eta || ''}
              onChange={(e) =>
                setDraft((p) => ({
                  ...(p || {}),
                  progress: { ...progress, eta: e.target.value },
                }))
              }
            />
          </Field>

          <Field label="Completed units">
            <TextInput
              type="number"
              min={0}
              value={Number.isFinite(progress.completedUnits) ? progress.completedUnits : 0}
              onChange={(e) =>
                setDraft((p) => ({
                  ...(p || {}),
                  progress: { ...progress, completedUnits: Number(e.target.value) },
                }))
              }
            />
          </Field>
          <Field label="Total units">
            <TextInput
              type="number"
              min={0}
              value={Number.isFinite(progress.totalUnits) ? progress.totalUnits : 0}
              onChange={(e) =>
                setDraft((p) => ({
                  ...(p || {}),
                  progress: { ...progress, totalUnits: Number(e.target.value) },
                }))
              }
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Next up">
              <TextInput
                value={progress.nextUp || ''}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...(p || {}),
                    progress: { ...progress, nextUp: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section
        title="Notifications & alerts"
        action={
          <button
            type="button"
            onClick={() =>
              setDraft((p) =>
                addArrayItem(p, 'notifications', {
                  id: makeId('n'),
                  type: 'info',
                  title: 'New notification',
                  message: '',
                  date: '',
                  action: { label: '', href: '' },
                })
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Add
          </button>
        }
      >
        {notifications.length === 0 ? (
          <div className="text-sm text-slate-600">No notifications.</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, idx) => (
              <div key={n.id || idx} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-900">Notification</div>
                  <button
                    type="button"
                    onClick={() => setDraft((p) => removeArrayItem(p, 'notifications', idx))}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-800"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="ID">
                    <TextInput
                      value={n.id || ''}
                      onChange={(e) => setDraft((p) => updateArrayItem(p, 'notifications', idx, { id: e.target.value }))}
                    />
                  </Field>

                  <Field label="Type">
                    <Select
                      value={n.type || 'info'}
                      onChange={(e) =>
                        setDraft((p) => updateArrayItem(p, 'notifications', idx, { type: e.target.value }))
                      }
                    >
                      <option value="info">info</option>
                      <option value="warning">warning</option>
                      <option value="success">success</option>
                    </Select>
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Title">
                      <TextInput
                        value={n.title || ''}
                        onChange={(e) =>
                          setDraft((p) => updateArrayItem(p, 'notifications', idx, { title: e.target.value }))
                        }
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Message">
                      <TextArea
                        rows={3}
                        value={n.message || ''}
                        onChange={(e) =>
                          setDraft((p) => updateArrayItem(p, 'notifications', idx, { message: e.target.value }))
                        }
                      />
                    </Field>
                  </div>

                  <Field label="Date">
                    <TextInput
                      value={n.date || ''}
                      onChange={(e) =>
                        setDraft((p) => updateArrayItem(p, 'notifications', idx, { date: e.target.value }))
                      }
                    />
                  </Field>

                  <Field label="Action label">
                    <TextInput
                      value={n.action?.label || ''}
                      onChange={(e) =>
                        setDraft((p) =>
                          updateArrayItem(p, 'notifications', idx, {
                            action: { ...(n.action || {}), label: e.target.value },
                          })
                        )
                      }
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Action href" hint="e.g. /policy">
                      <TextInput
                        value={n.action?.href || ''}
                        onChange={(e) =>
                          setDraft((p) =>
                            updateArrayItem(p, 'notifications', idx, {
                              action: { ...(n.action || {}), href: e.target.value },
                            })
                          )
                        }
                      />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Active material (resume)">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="ID">
            <TextInput
              value={active.id || ''}
              onChange={(e) => setDraft((p) => ({ ...(p || {}), activeMaterial: { ...active, id: e.target.value } }))}
            />
          </Field>
          <Field label="Type">
            <Select
              value={active.type || 'PDF'}
              onChange={(e) =>
                setDraft((p) => ({ ...(p || {}), activeMaterial: { ...active, type: e.target.value } }))
              }
            >
              <option value="PDF">PDF</option>
              <option value="Video">Video</option>
              <option value="Material">Material</option>
            </Select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Name">
              <TextInput
                value={active.name || ''}
                onChange={(e) =>
                  setDraft((p) => ({ ...(p || {}), activeMaterial: { ...active, name: e.target.value } }))
                }
              />
            </Field>
          </div>

          <Field label="Course title">
            <TextInput
              value={active.courseTitle || ''}
              onChange={(e) =>
                setDraft((p) => ({ ...(p || {}), activeMaterial: { ...active, courseTitle: e.target.value } }))
              }
            />
          </Field>
          <Field label="Progress %" hint="0–100">
            <TextInput
              type="number"
              min={0}
              max={100}
              value={Number.isFinite(active.progressPct) ? active.progressPct : 0}
              onChange={(e) =>
                setDraft((p) => ({
                  ...(p || {}),
                  activeMaterial: { ...active, progressPct: Number(e.target.value) },
                }))
              }
            />
          </Field>

          <Field label="Last seen">
            <TextInput
              value={active.lastSeen || ''}
              onChange={(e) =>
                setDraft((p) => ({ ...(p || {}), activeMaterial: { ...active, lastSeen: e.target.value } }))
              }
            />
          </Field>

          <Field label="Resume href" hint="e.g. /materials">
            <TextInput
              value={active.resumeHref || ''}
              onChange={(e) =>
                setDraft((p) => ({ ...(p || {}), activeMaterial: { ...active, resumeHref: e.target.value } }))
              }
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Module title">
              <TextInput
                value={active.moduleTitle || ''}
                onChange={(e) =>
                  setDraft((p) => ({ ...(p || {}), activeMaterial: { ...active, moduleTitle: e.target.value } }))
                }
              />
            </Field>
          </div>
        </div>
      </Section>
    </div>
  );
}

function ListEditor({ title, items, onAdd, children }) {
  return (
    <Section
      title={title}
      action={
        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Add
        </button>
      }
    >
      {items.length === 0 ? <div className="text-sm text-slate-600">No items.</div> : children}
    </Section>
  );
}

function CoursesEditor({ draft, setDraft }) {
  const courses = Array.isArray(draft?.courses) ? draft.courses : [];

  return (
    <ListEditor
      title="Courses"
      items={courses}
      onAdd={() =>
        setDraft((p) =>
          addArrayItem(p, 'courses', {
            id: makeId('course'),
            title: 'New course',
            code: '',
            progressPct: 0,
          })
        )
      }
    >
      <div className="space-y-3">
        {courses.map((c, idx) => (
          <div key={c.id || idx} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Course</div>
              <button
                type="button"
                onClick={() => setDraft((p) => removeArrayItem(p, 'courses', idx))}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800"
              >
                Remove
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="ID">
                <TextInput
                  value={c.id || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'courses', idx, { id: e.target.value }))}
                />
              </Field>
              <Field label="Code">
                <TextInput
                  value={c.code || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'courses', idx, { code: e.target.value }))}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Title">
                  <TextInput
                    value={c.title || ''}
                    onChange={(e) =>
                      setDraft((p) => updateArrayItem(p, 'courses', idx, { title: e.target.value }))
                    }
                  />
                </Field>
              </div>
              <Field label="Progress %" hint="0–100">
                <TextInput
                  type="number"
                  min={0}
                  max={100}
                  value={Number.isFinite(c.progressPct) ? c.progressPct : 0}
                  onChange={(e) =>
                    setDraft((p) => updateArrayItem(p, 'courses', idx, { progressPct: Number(e.target.value) }))
                  }
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </ListEditor>
  );
}

function MaterialsEditor({ draft, setDraft }) {
  const materials = Array.isArray(draft?.materials) ? draft.materials : [];

  return (
    <ListEditor
      title="Materials"
      items={materials}
      onAdd={() =>
        setDraft((p) =>
          addArrayItem(p, 'materials', {
            id: makeId('mat'),
            name: 'New material',
            type: 'PDF',
            visibility: 'Assigned',
          })
        )
      }
    >
      <div className="space-y-3">
        {materials.map((m, idx) => (
          <div key={m.id || idx} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Material</div>
              <button
                type="button"
                onClick={() => setDraft((p) => removeArrayItem(p, 'materials', idx))}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800"
              >
                Remove
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="ID">
                <TextInput
                  value={m.id || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'materials', idx, { id: e.target.value }))}
                />
              </Field>
              <Field label="Type">
                <Select
                  value={m.type || 'PDF'}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'materials', idx, { type: e.target.value }))}
                >
                  <option value="PDF">PDF</option>
                  <option value="Video">Video</option>
                </Select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Name">
                  <TextInput
                    value={m.name || ''}
                    onChange={(e) => setDraft((p) => updateArrayItem(p, 'materials', idx, { name: e.target.value }))}
                  />
                </Field>
              </div>
              <Field label="Visibility">
                <Select
                  value={m.visibility || 'Assigned'}
                  onChange={(e) =>
                    setDraft((p) => updateArrayItem(p, 'materials', idx, { visibility: e.target.value }))
                  }
                >
                  <option value="Assigned">Assigned</option>
                  <option value="Optional">Optional</option>
                </Select>
              </Field>
            </div>
          </div>
        ))}
      </div>
    </ListEditor>
  );
}

function ScheduleEditor({ draft, setDraft }) {
  const classes = Array.isArray(draft?.classes) ? draft.classes : [];

  return (
    <ListEditor
      title="Classes"
      items={classes}
      onAdd={() =>
        setDraft((p) =>
          addArrayItem(p, 'classes', {
            id: makeId('class'),
            name: 'New class',
            when: '',
            location: '',
          })
        )
      }
    >
      <div className="space-y-3">
        {classes.map((c, idx) => (
          <div key={c.id || idx} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Class</div>
              <button
                type="button"
                onClick={() => setDraft((p) => removeArrayItem(p, 'classes', idx))}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800"
              >
                Remove
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="ID">
                <TextInput
                  value={c.id || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'classes', idx, { id: e.target.value }))}
                />
              </Field>
              <Field label="Location">
                <TextInput
                  value={c.location || ''}
                  onChange={(e) =>
                    setDraft((p) => updateArrayItem(p, 'classes', idx, { location: e.target.value }))
                  }
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Name">
                  <TextInput
                    value={c.name || ''}
                    onChange={(e) => setDraft((p) => updateArrayItem(p, 'classes', idx, { name: e.target.value }))}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="When">
                  <TextInput
                    value={c.when || ''}
                    onChange={(e) => setDraft((p) => updateArrayItem(p, 'classes', idx, { when: e.target.value }))}
                  />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ListEditor>
  );
}

function PolicyEditor({ draft, setDraft }) {
  const sections = Array.isArray(draft?.sections) ? draft.sections : [];

  return (
    <ListEditor
      title="Policy sections"
      items={sections}
      onAdd={() =>
        setDraft((p) =>
          addArrayItem(p, 'sections', {
            id: makeId('policy'),
            title: 'New section',
            body: '',
          })
        )
      }
    >
      <div className="space-y-3">
        {sections.map((s, idx) => (
          <div key={s.id || idx} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Section</div>
              <button
                type="button"
                onClick={() => setDraft((p) => removeArrayItem(p, 'sections', idx))}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800"
              >
                Remove
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <Field label="ID">
                <TextInput
                  value={s.id || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'sections', idx, { id: e.target.value }))}
                />
              </Field>
              <Field label="Title">
                <TextInput
                  value={s.title || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'sections', idx, { title: e.target.value }))}
                />
              </Field>
              <Field label="Body">
                <TextArea
                  rows={4}
                  value={s.body || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'sections', idx, { body: e.target.value }))}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </ListEditor>
  );
}

function KnowledgeHubEditor({ draft, setDraft }) {
  const items = Array.isArray(draft?.items) ? draft.items : [];

  return (
    <ListEditor
      title="Knowledge hub items"
      items={items}
      onAdd={() =>
        setDraft((p) =>
          addArrayItem(p, 'items', {
            id: makeId('kh'),
            title: 'New item',
            href: '#',
          })
        )
      }
    >
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={it.id || idx} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Item</div>
              <button
                type="button"
                onClick={() => setDraft((p) => removeArrayItem(p, 'items', idx))}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800"
              >
                Remove
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="ID">
                <TextInput
                  value={it.id || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'items', idx, { id: e.target.value }))}
                />
              </Field>
              <Field label="Href">
                <TextInput
                  value={it.href || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'items', idx, { href: e.target.value }))}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Title">
                  <TextInput
                    value={it.title || ''}
                    onChange={(e) => setDraft((p) => updateArrayItem(p, 'items', idx, { title: e.target.value }))}
                  />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ListEditor>
  );
}

function RecordingsEditor({ draft, setDraft }) {
  const recordings = Array.isArray(draft?.recordings) ? draft.recordings : [];

  return (
    <ListEditor
      title="Recordings"
      items={recordings}
      onAdd={() =>
        setDraft((p) =>
          addArrayItem(p, 'recordings', {
            id: makeId('rec'),
            title: 'New recording',
            date: '',
            href: '#',
          })
        )
      }
    >
      <div className="space-y-3">
        {recordings.map((r, idx) => (
          <div key={r.id || idx} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Recording</div>
              <button
                type="button"
                onClick={() => setDraft((p) => removeArrayItem(p, 'recordings', idx))}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800"
              >
                Remove
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="ID">
                <TextInput
                  value={r.id || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'recordings', idx, { id: e.target.value }))}
                />
              </Field>
              <Field label="Date">
                <TextInput
                  value={r.date || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'recordings', idx, { date: e.target.value }))}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Title">
                  <TextInput
                    value={r.title || ''}
                    onChange={(e) => setDraft((p) => updateArrayItem(p, 'recordings', idx, { title: e.target.value }))}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Href">
                  <TextInput
                    value={r.href || ''}
                    onChange={(e) => setDraft((p) => updateArrayItem(p, 'recordings', idx, { href: e.target.value }))}
                  />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ListEditor>
  );
}

function ResultsEditor({ draft, setDraft }) {
  const results = Array.isArray(draft?.results) ? draft.results : [];

  return (
    <ListEditor
      title="Results"
      items={results}
      onAdd={() =>
        setDraft((p) =>
          addArrayItem(p, 'results', {
            id: makeId('res'),
            exam: 'New exam',
            date: '',
            score: '',
            status: 'Passed',
          })
        )
      }
    >
      <div className="space-y-3">
        {results.map((r, idx) => (
          <div key={r.id || idx} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Result</div>
              <button
                type="button"
                onClick={() => setDraft((p) => removeArrayItem(p, 'results', idx))}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800"
              >
                Remove
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="ID">
                <TextInput
                  value={r.id || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'results', idx, { id: e.target.value }))}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={r.status || 'Passed'}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'results', idx, { status: e.target.value }))}
                >
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Pending">Pending</option>
                </Select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Exam">
                  <TextInput
                    value={r.exam || ''}
                    onChange={(e) => setDraft((p) => updateArrayItem(p, 'results', idx, { exam: e.target.value }))}
                  />
                </Field>
              </div>
              <Field label="Date">
                <TextInput
                  value={r.date || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'results', idx, { date: e.target.value }))}
                />
              </Field>
              <Field label="Score">
                <TextInput
                  value={r.score || ''}
                  onChange={(e) => setDraft((p) => updateArrayItem(p, 'results', idx, { score: e.target.value }))}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </ListEditor>
  );
}

function HelpEditor({ draft, setDraft }) {
  const contact = draft?.contact && typeof draft.contact === 'object' ? draft.contact : {};
  const tickets = Array.isArray(draft?.tickets) ? draft.tickets : [];

  return (
    <div className="space-y-6">
      <Section title="Help desk contact">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Email">
            <TextInput
              value={contact.email || ''}
              onChange={(e) => setDraft((p) => ({ ...(p || {}), contact: { ...contact, email: e.target.value } }))}
            />
          </Field>
          <Field label="Phone">
            <TextInput
              value={contact.phone || ''}
              onChange={(e) => setDraft((p) => ({ ...(p || {}), contact: { ...contact, phone: e.target.value } }))}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Hours">
              <TextInput
                value={contact.hours || ''}
                onChange={(e) => setDraft((p) => ({ ...(p || {}), contact: { ...contact, hours: e.target.value } }))}
              />
            </Field>
          </div>
        </div>
      </Section>

      <ListEditor
        title="Tickets"
        items={tickets}
        onAdd={() =>
          setDraft((p) =>
            addArrayItem(p, 'tickets', {
              id: makeId('t'),
              subject: 'New ticket',
              status: 'Open',
              date: '',
            })
          )
        }
      >
        <div className="space-y-3">
          {tickets.map((t, idx) => (
            <div key={t.id || idx} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">Ticket</div>
                <button
                  type="button"
                  onClick={() => setDraft((p) => removeArrayItem(p, 'tickets', idx))}
                  className="text-xs font-semibold text-rose-700 hover:text-rose-800"
                >
                  Remove
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="ID">
                  <TextInput
                    value={t.id || ''}
                    onChange={(e) => setDraft((p) => updateArrayItem(p, 'tickets', idx, { id: e.target.value }))}
                  />
                </Field>
                <Field label="Status">
                  <Select
                    value={t.status || 'Open'}
                    onChange={(e) => setDraft((p) => updateArrayItem(p, 'tickets', idx, { status: e.target.value }))}
                  >
                    <option value="Open">Open</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </Select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Subject">
                    <TextInput
                      value={t.subject || ''}
                      onChange={(e) => setDraft((p) => updateArrayItem(p, 'tickets', idx, { subject: e.target.value }))}
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Date">
                    <TextInput
                      value={t.date || ''}
                      onChange={(e) => setDraft((p) => updateArrayItem(p, 'tickets', idx, { date: e.target.value }))}
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ListEditor>
    </div>
  );
}

const FORM_EDITORS = {
  dashboard: DashboardEditor,
  courses: CoursesEditor,
  materials: MaterialsEditor,
  schedule: ScheduleEditor,
  policy: PolicyEditor,
  recordings: RecordingsEditor,
  results: ResultsEditor,
  'knowledge-hub': KnowledgeHubEditor,
  help: HelpEditor,
};

export default function AdminContentPage() {
  const location = useLocation();
  const [keys, setKeys] = useState(null);
  const [selected, setSelected] = useState('dashboard');
  const [mode, setMode] = useState('form');
  const [draft, setDraft] = useState(null);
  const [payloadText, setPayloadText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveOk, setSaveOk] = useState(false);

  const keyFromUrl = useMemo(() => {
    const search = location.search || '';
    const match = search.match(/[?&]key=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }, [location.search]);

  const canSave = useMemo(() => !saving && !loading && selected, [saving, loading, selected]);
  const isFormSupported = Boolean(FORM_EDITORS[selected]);

  useEffect(() => {
    let cancelled = false;
    apiGet('/api/admin/app-data/keys')
      .then((json) => {
        if (cancelled) return;
        const list = Array.isArray(json.keys) ? json.keys : [];
        setKeys(list);

        // Prefer URL key if present (even if not in DB yet).
        if (keyFromUrl) {
          setSelected(keyFromUrl);
          if (!list.includes(keyFromUrl)) {
            setKeys([...list, keyFromUrl].sort((a, b) => String(a).localeCompare(String(b))));
          }
          return;
        }

        if (list.includes('dashboard')) setSelected('dashboard');
        else if (list[0]) setSelected(list[0]);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!keyFromUrl) return;

    // Allow opening / creating a key that doesn't exist yet.
    setSelected(keyFromUrl);

    if (Array.isArray(keys) && !keys.includes(keyFromUrl)) {
      setKeys([...keys, keyFromUrl].sort((a, b) => String(a).localeCompare(String(b))));
    }
  }, [keys, keyFromUrl]);

  const loadSelected = () => {
    if (!selected) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    setSaveOk(false);

    apiGet(`/api/admin/app-data/${selected}`)
      .then((json) => {
        if (cancelled) return;
        setDraft(json.payload);
        setPayloadText(prettyJson(json.payload));
        setMode(FORM_EDITORS[selected] ? 'form' : 'json');
      })
      .catch((err) => {
        // If the key doesn't exist yet, initialize an empty payload
        // so the user can hit Save to create it.
        if (cancelled) return;
        if (err && err.status === 404) {
          setDraft({});
          setPayloadText(prettyJson({}));
          setMode('json');
          setError(null);
          return;
        }

        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    const cleanup = loadSelected();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const onSave = () => {
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);

    let payload;
    if (mode === 'json') {
      try {
        payload = JSON.parse(payloadText);
      } catch {
        setSaveError(new Error('Invalid JSON'));
        setSaving(false);
        return;
      }
    } else {
      payload = draft;
    }

    apiPut(`/api/admin/app-data/${selected}`, { payload })
      .then(() => setSaveOk(true))
      .catch((err) => setSaveError(err))
      .finally(() => setSaving(false));
  };

  const switchToJson = () => {
    setPayloadText(prettyJson(draft));
    setMode('json');
  };

  const switchToForm = () => {
    if (!isFormSupported) return;
    setMode('form');
  };

  const Editor = FORM_EDITORS[selected];

  return (
    <div className="space-y-6">
      <Section
        title="Content manager"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              disabled={!keys}
            >
              {(keys || []).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={switchToForm}
                disabled={!isFormSupported}
                className={
                  'rounded-lg px-3 py-1.5 text-xs font-semibold ' +
                  (mode === 'form' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50') +
                  (!isFormSupported ? ' opacity-50' : '')
                }
              >
                Form
              </button>
              <button
                type="button"
                onClick={switchToJson}
                className={
                  'rounded-lg px-3 py-1.5 text-xs font-semibold ' +
                  (mode === 'json' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50')
                }
              >
                JSON
              </button>
            </div>

            <button
              type="button"
              onClick={() => loadSelected()}
              disabled={loading || saving}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={!canSave}
              className="rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        }
      >
        <div className="text-xs text-slate-500">
          Update portal content that student pages load from the backend.
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error.message || 'Failed to load content.'}
          </div>
        ) : null}

        {saveError ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {saveError.message || 'Failed to save.'}
          </div>
        ) : null}

        {saveOk ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Saved.
          </div>
        ) : null}
      </Section>

      {mode === 'json' ? (
        <Section title={`Edit: ${selected} (JSON)`}>
          <textarea
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            className="h-[32rem] w-full rounded-xl border border-slate-300 p-3 font-mono text-xs text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            spellCheck={false}
          />
        </Section>
      ) : Editor ? (
        <Editor draft={draft} setDraft={setDraft} />
      ) : (
        <Section title={`Edit: ${selected}`}>
          <div className="text-sm text-slate-600">No form editor for this key. Switch to JSON mode.</div>
        </Section>
      )}
    </div>
  );
}
