import { Bell, LogOut } from 'lucide-react';

export default function AdminTopbar({ admin, onLogout }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 items-center justify-between px-5">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-700">
            Hello {admin?.name || 'Admin'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
