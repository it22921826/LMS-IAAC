import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import EntityTable from '../../components/EntityTable.jsx';
import EntityNameDialog from '../../components/EntityNameDialog.jsx';
import { apiGet } from '../../api/http.js';
import { getAcademics, saveAcademics } from '../../services/academicsAdmin.service.js';

export default function AdminBranchesPage() {
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

  async function refresh() {
    const res = await apiGet('/api/materials/hierarchy');
    return Array.isArray(res?.branches) ? res.branches : [];
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    refresh()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load branches.');
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

  async function addBranch(name) {
    const { payload } = await getAcademics();
    const branches = Array.isArray(payload?.branches) ? payload.branches : [];
    const id = `branch-${Date.now().toString(36)}`;
    await saveAcademics({
      ...(payload || {}),
      branches: [{ id, name, intakes: [] }, ...branches],
    });
  }

  async function renameBranch(row, nextName) {
    const { payload } = await getAcademics();
    const branches = Array.isArray(payload?.branches) ? payload.branches : [];
    const updated = branches.map((b) =>
      String(b?.id) === String(row?.id) ? { ...(b || {}), name: nextName } : b
    );
    await saveAcademics({ ...(payload || {}), branches: updated });
  }

  async function onDialogConfirm(value) {
    setDialogError('');
    setError('');
    setSaving(true);
    try {
      if (dialogMode === 'edit' && dialogRow) {
        await renameBranch(dialogRow, value);
      } else {
        await addBranch(value);
      }
      const refreshed = await refresh();
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
      <Breadcrumbs items={[{ label: 'Home', to: '/admin' }, { label: 'Branches' }]} />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
          Loading...
        </div>
      ) : (
        <EntityTable
          title="Branches"
          data={items}
          columns={columns}
          empty={{
            title: 'No branches found',
            description: 'Add your first branch to start creating intakes and batches for material uploads.',
            addLabel: 'Add New',
          }}
          onAction={{
            onView: (row) => navigate(`/admin/branches/${row.id}/intakes`),
            onEdit: (row) => openRenameDialog(row),
            onAddNew: () => openAddDialog(),
          }}
        />
      )}

      <EntityNameDialog
        open={dialogOpen}
        title={dialogMode === 'edit' ? 'Rename branch' : 'Add branch'}
        label="Branch name"
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
