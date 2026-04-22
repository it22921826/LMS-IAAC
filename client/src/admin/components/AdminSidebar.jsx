import {
  BookOpen,
  Calendar,
  LayoutDashboard,
  Users,
  GraduationCap,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Students', to: '/admin/students', icon: GraduationCap },
  // Course Overview now uses the hierarchical manager (Faculties -> Programs -> Intakes)
  { label: 'Course Overview', to: '/admin/faculties', icon: BookOpen },
  { label: 'Class Schedule', to: '/admin/schedule', icon: Calendar },
];

export default function AdminSidebar({ admin }) {
  const location = useLocation();
  const role = admin?.role || 'superadmin';
  const nav = role === 'staff' ? NAV.filter((i) => !['/admin/users', '/admin/faculties'].includes(i.to)) : NAV;

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
          {nav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  (() => {
                    const isAdminIndex = item.to === '/admin';

                    const active =
                      (isAdminIndex && location.pathname === '/admin') ||
                      (item.to === '/admin/students' && location.pathname.startsWith('/admin/students'));

                    const isReallyActive = active || isActive;

                    return (
                      `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ` +
                      (isReallyActive
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-700 hover:bg-slate-50')
                    );
                  })()
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
