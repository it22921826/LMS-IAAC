import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPatch } from '../../api/http.js';
import { KeyRound } from 'lucide-react';
import logo from '../../image/logo.png';

export default function LecturerChangePasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError({ message: 'Passwords do not match' });
      return;
    }
    setSubmitting(true);
    setError(null);
    apiPatch('/api/auth/lecturer/change-password', { newPassword })
      .then(() => navigate('/lecturer/dashboard', { replace: true }))
      .catch((err) => setError(err))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="IAAC Logo" className="h-12 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <KeyRound className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Set your password</h2>
            <p className="text-xs text-slate-500">Required before accessing your portal</p>
          </div>
        </div>

        <div className="my-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          This is your first login. Please set a personal password to continue.
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error.message || 'Something went wrong.'}
          </div>
        )}

        <form className="space-y-4 mt-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
              placeholder="Repeat your password"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#003580] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-all disabled:opacity-70 shadow-md"
          >
            {submitting ? 'Saving…' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
