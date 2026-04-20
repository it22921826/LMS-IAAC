import { apiGet } from '../api/http';

// Fetching functions kept outside components for clean UI code.
// These hit admin-protected endpoints (requires admin session cookies).

export async function fetchFaculties() {
  const res = await apiGet('/api/admin/academics/faculties');
  return Array.isArray(res?.items) ? res.items : [];
}

export async function fetchProgramsByFaculty(facultyId) {
  const res = await apiGet(`/api/admin/academics/programs?facultyId=${encodeURIComponent(facultyId)}`);
  return Array.isArray(res?.items) ? res.items : [];
}

export async function fetchIntakesByProgram(programId) {
  const res = await apiGet(`/api/admin/academics/intakes?programId=${encodeURIComponent(programId)}`);
  return Array.isArray(res?.items) ? res.items : [];
}

export async function fetchSubjectsByIntake(intakeId) {
  const res = await apiGet(`/api/admin/academics/subjects?intakeId=${encodeURIComponent(intakeId)}`);
  return Array.isArray(res?.items) ? res.items : [];
}
