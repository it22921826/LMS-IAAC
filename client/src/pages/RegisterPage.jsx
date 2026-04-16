import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../api/http.js';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    nic: '',
    course: '',
    studentId: '',
    whatsappNumber: '',
    phoneNumber: '',
    address: '',
    guardianName: '',
    guardianPhoneNumber: '',
    password: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    apiPost('/api/auth/register', form)
      .then(() => {
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Student Registration</h1>
          <p className="mt-1 text-sm text-slate-600">Create your IAAC student account.</p>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error.message || 'Registration failed.'}
            </div>
          ) : null}

          <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Full name *</label>
              <input
                value={form.fullName}
                onChange={update('fullName')}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Email *</label>
              <input
                value={form.email}
                onChange={update('email')}
                type="email"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Student ID *</label>
              <input
                value={form.studentId}
                onChange={update('studentId')}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">NIC</label>
              <input
                value={form.nic}
                onChange={update('nic')}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Course</label>
              <input
                value={form.course}
                onChange={update('course')}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">WhatsApp number</label>
              <input
                value={form.whatsappNumber}
                onChange={update('whatsappNumber')}
                type="tel"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Phone number</label>
              <input
                value={form.phoneNumber}
                onChange={update('phoneNumber')}
                type="tel"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Address</label>
              <input
                value={form.address}
                onChange={update('address')}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Guardian name</label>
              <input
                value={form.guardianName}
                onChange={update('guardianName')}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Guardian phone number</label>
              <input
                value={form.guardianPhoneNumber}
                onChange={update('guardianPhoneNumber')}
                type="tel"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Password *</label>
              <input
                value={form.password}
                onChange={update('password')}
                type="password"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                autoComplete="new-password"
                required
                minLength={8}
              />
              <div className="mt-2 text-xs text-slate-500">Minimum 8 characters.</div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
              >
                {submitting ? 'Creating account…' : 'Create account'}
              </button>
            </div>

            <div className="md:col-span-2 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-800">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
