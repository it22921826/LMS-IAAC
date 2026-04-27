import { Inbox, Pencil, Plus, Eye, Trash2 } from 'lucide-react';

/**
 * EntityTable
 * Props:
 * - title: string
 * - data: array
 * - columns: [{ header: string, key?: string, render?: (row) => ReactNode, className?: string }]
 * - onAction: { onView?: (row) => void, onEdit?: (row) => void, onDelete?: (row) => void, onAddNew?: () => void }
 * - empty: { title?: string, description?: string, addLabel?: string }
 */
export default function EntityTable({ title, data, columns, onAction, empty }) {
  const rows = Array.isArray(data) ? data : [];
  const cols = Array.isArray(columns) ? columns : [];

  if (rows.length === 0) {
    const emptyTitle = empty?.title || 'No items yet';
    const emptyDescription =
      empty?.description || 'Get started by adding your first item.';
    const addLabel = empty?.addLabel || 'Add New';

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {title ? <h2 className="text-sm font-bold text-slate-900">{title}</h2> : null}

        <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
            <Inbox className="h-6 w-6 text-slate-500" />
          </div>
          <div className="mt-4 text-sm font-semibold text-slate-900">{emptyTitle}</div>
          <div className="mt-1 max-w-sm text-sm text-slate-600">{emptyDescription}</div>
          {onAction?.onAddNew ? (
            <button
              type="button"
              onClick={() => onAction.onAddNew()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              {addLabel}
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {onAction?.onAddNew ? (
          <button
            type="button"
            onClick={() => onAction.onAddNew()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              {cols.map((c, idx) => (
                <th key={c.header || idx} className={`px-5 py-3 ${c.className || ''}`}>
                  {c.header}
                </th>
              ))}
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rIdx) => (
              <tr key={row?.id || rIdx} className="hover:bg-slate-50">
                {cols.map((c, cIdx) => (
                  <td key={`${rIdx}-${c.header || cIdx}`} className={`px-5 py-3 ${c.className || ''}`}>
                    {typeof c.render === 'function'
                      ? c.render(row)
                      : c.key
                        ? String(row?.[c.key] ?? '')
                        : ''}
                  </td>
                ))}

                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    {onAction?.onView ? (
                      <button
                        type="button"
                        onClick={() => onAction.onView(row)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    ) : null}
                    {onAction?.onEdit ? (
                      <button
                        type="button"
                        onClick={() => onAction.onEdit(row)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                    ) : null}
                    {onAction?.onDelete ? (
                      <button
                        type="button"
                        onClick={() => onAction.onDelete(row)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-slate-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
