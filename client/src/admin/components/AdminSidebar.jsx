import {
  Calendar,
  FileText,
  LayoutDashboard,
  Library,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Students', to: '/admin/students', icon: Users },
  { label: 'Content', to: '/admin/content', icon: Library },
  { label: 'Schedule', to: '/admin/content?key=schedule', icon: Calendar },
  { label: 'Policy', to: '/admin/content?key=policy', icon: FileText },
];

export default function AdminSidebar({ admin }) {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003580] font-bold text-white">
          IA
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-900">IAAC Admin</div>
          <div className="truncate text-[11px] font-semibold text-slate-500">{admin?.name || 'Admin'}</div>
        </div>
      </div>

      <nav className="p-3">
        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ` +
                  (isActive
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-700 hover:bg-slate-50')
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
