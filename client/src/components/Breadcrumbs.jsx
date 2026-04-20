import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Breadcrumbs
 * items: [{ label: string, to?: string }]
 */
export default function Breadcrumbs({ items }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-600">
      <Home className="h-4 w-4" />
      {safeItems.map((item, idx) => {
        const isLast = idx === safeItems.length - 1;
        const label = item?.label || '';
        const to = item?.to;

        return (
          <span key={`${label}-${idx}`} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-slate-400" />
            {to && !isLast ? (
              <Link to={to} className="font-medium text-slate-700 hover:text-slate-900">
                {label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-slate-900' : 'text-slate-700'}>{label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
