import { useOutletContext } from 'react-router-dom';
import { Calendar, FileText, Users, BookOpen } from 'lucide-react';

export default function LecturerDashboardPage() {
  const { lecturer } = useOutletContext();

  const cards = [
    { label: 'My Schedule', icon: Calendar, desc: 'View your upcoming classes and lectures.' },
    { label: 'Study Materials', icon: FileText, desc: 'Manage and upload materials for your subjects.' },
    { label: 'Assigned Batches', icon: Users, desc: 'See the student batches assigned to you.' },
    { label: 'Subject', icon: BookOpen, desc: lecturer?.subject || 'No subject assigned yet.' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-[#003580] px-8 py-7 text-white shadow-lg">
        <p className="text-sm font-medium text-sky-200 uppercase tracking-widest mb-1">Lecturer Portal</p>
        <h1 className="text-2xl font-bold">Welcome back, {lecturer?.name?.split(' ')[0] || 'Lecturer'}</h1>
        {lecturer?.subject && (
          <p className="mt-1 text-sky-100 text-sm">Subject: <span className="font-semibold">{lecturer.subject}</span></p>
        )}
        {lecturer?.branchId && (
          <p className="text-sky-100 text-sm">Branch: <span className="font-semibold">{lecturer.branchId}</span></p>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 mb-3">
              <card.icon className="h-5 w-5 text-sky-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{card.label}</h3>
            <p className="mt-1 text-xs text-slate-500">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
