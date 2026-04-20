import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import EntityTable from '../../components/EntityTable.jsx';
import EntityNameDialog from '../../components/EntityNameDialog.jsx';
import { fetchEntities } from '../../services/entities.service.js';
import { getAcademics, saveAcademics } from '../../services/academicsAdmin.service.js';

export default function AdminFacultiesPage() {
  const navigate = useNavigate();
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

    fetchEntities('faculties')
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load faculties.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  async function addFaculty(name) {
    const { payload } = await getAcademics();
    const faculties = Array.isArray(payload?.faculties) ? payload.faculties : [];
    const id = `fac-${Date.now().toString(36)}`;
    await saveAcademics({
      ...(payload || {}),
      faculties: [{ id, name, programs: [] }, ...faculties],
    });
  }

  async function renameFaculty(row, nextName) {
    const { payload } = await getAcademics();
    const faculties = Array.isArray(payload?.faculties) ? payload.faculties : [];
    const updated = faculties.map((f) =>
      String(f?.id) === String(row?.id) ? { ...(f || {}), name: nextName } : f
    );
    await saveAcademics({ ...(payload || {}), faculties: updated });
  }

  async function onDialogConfirm(value) {
    setDialogError('');
    setError('');
    setSaving(true);
    try {
      if (dialogMode === 'edit' && dialogRow) {
        await renameFaculty(dialogRow, value);
      } else {
        await addFaculty(value);
      }
      const refreshed = await fetchEntities('faculties');
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
      <Breadcrumbs items={[{ label: 'Home', to: '/admin' }, { label: 'Faculties' }]} />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
          Loading...
        </div>
      ) : (
        <EntityTable
          title="Faculties"
          data={items}
          columns={columns}
          empty={{
            title: 'No faculties found',
            description: 'Add your first faculty to start building programs and intakes.',
            addLabel: 'Add New',
          }}
          onAction={{
            onView: (row) => navigate(`/admin/faculties/${row.id}/programs`),
            onEdit: (row) => openRenameDialog(row),
            onAddNew: () => openAddDialog(),
          }}
        />
      )}

      <EntityNameDialog
        open={dialogOpen}
        title={dialogMode === 'edit' ? 'Rename faculty' : 'Add faculty'}
        label="Faculty name"
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
