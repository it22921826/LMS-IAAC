import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import EntityTable from '../../components/EntityTable.jsx';
import EntityNameDialog from '../../components/EntityNameDialog.jsx';
import { fetchEntities } from '../../services/entities.service.js';
import { getAcademics, saveAcademics } from '../../services/academicsAdmin.service.js';

export default function AdminProgramsPage() {
  const navigate = useNavigate();
  const { facultyId } = useParams();

  const [faculties, setFaculties] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [dialogInitialValue, setDialogInitialValue] = useState('');
  const [dialogRow, setDialogRow] = useState(null);
  const [dialogError, setDialogError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([fetchEntities('faculties'), fetchEntities('programs', facultyId)])
      .then(([facList, progList]) => {
        if (cancelled) return;
        setFaculties(facList);
        setItems(progList);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load programs.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [facultyId]);

  const facultyName = useMemo(() => {
    const found = faculties.find((f) => String(f.id) === String(facultyId));
    return found?.name || 'Faculty';
  }, [faculties, facultyId]);

  const columns = useMemo(
    () => [
      { header: 'Name', key: 'name' },
      { header: 'ID', key: 'id', className: 'text-xs text-slate-500' },
    ],
    []
  );

  function openAddDialog() {
    setDialogError('');
    setDialogMode('add');
    setDialogInitialValue('');
    setDialogRow(null);
    setDialogOpen(true);
  }

  function openRenameDialog(row) {
    setDialogError('');
    setDialogMode('edit');
    setDialogInitialValue(row?.name || '');
    setDialogRow(row || null);
    setDialogOpen(true);
  }

  async function addProgram(name) {
    const { payload } = await getAcademics();
    const facultiesPayload = Array.isArray(payload?.faculties) ? payload.faculties : [];
    const updatedFaculties = facultiesPayload.map((f) => {
      if (String(f?.id) !== String(facultyId)) return f;
      const programs = Array.isArray(f?.programs) ? f.programs : [];
      const id = `prog-${Date.now().toString(36)}`;
      return {
        ...(f || {}),
        programs: [{ id, name, intakes: [] }, ...programs],
      };
    });
    await saveAcademics({ ...(payload || {}), faculties: updatedFaculties });
  }

  async function renameProgram(row, nextName) {
    const { payload } = await getAcademics();
    const facultiesPayload = Array.isArray(payload?.faculties) ? payload.faculties : [];
    const updatedFaculties = facultiesPayload.map((f) => {
      const programs = Array.isArray(f?.programs) ? f.programs : [];
      return {
        ...(f || {}),
        programs: programs.map((p) =>
          String(p?.id) === String(row?.id) ? { ...(p || {}), name: nextName } : p
        ),
      };
    });

    await saveAcademics({ ...(payload || {}), faculties: updatedFaculties });
  }

  async function onDialogConfirm(value) {
    setDialogError('');
    setError('');
    setSaving(true);
    try {
      if (dialogMode === 'edit' && dialogRow) {
        await renameProgram(dialogRow, value);
      } else {
        await addProgram(value);
      }
      const refreshed = await fetchEntities('programs', facultyId);
      setItems(refreshed);
      setDialogOpen(false);
    } catch {
      setDialogError('Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/admin' },
          { label: 'Faculties', to: '/admin/faculties' },
          { label: facultyName },
          { label: 'Programs' },
        ]}
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
          Loading...
        </div>
      ) : (
        <EntityTable
          title={`Programs — ${facultyName}`}
          data={items}
          columns={columns}
          empty={{
            title: 'No programs found',
            description: 'Add a program under this faculty to continue.',
            addLabel: 'Add New',
          }}
          onAction={{
            onView: (row) => navigate(`/admin/programs/${row.id}/intakes`),
            onEdit: (row) => openRenameDialog(row),
            onAddNew: () => openAddDialog(),
          }}
        />
      )}

      <EntityNameDialog
        open={dialogOpen}
        title={dialogMode === 'edit' ? 'Rename program' : 'Add program'}
        label="Program name"
        initialValue={dialogInitialValue}
        confirmLabel={dialogMode === 'edit' ? 'Update' : 'Create'}
        loading={saving}
        error={dialogError}
        onClose={() => (saving ? null : setDialogOpen(false))}
        onConfirm={onDialogConfirm}
      />
    </div>
  );
}
