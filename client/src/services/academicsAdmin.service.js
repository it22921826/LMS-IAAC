import { apiGet, apiPut } from '../api/http';

const EMPTY_ACADEMICS = { faculties: [] };

export async function getAcademics() {
  try {
    const res = await apiGet('/api/admin/app-data/academics');
    const payload = res?.payload && typeof res.payload === 'object' ? res.payload : EMPTY_ACADEMICS;
    return {
      key: 'academics',
      payload,
    };
  } catch (e) {
    // If it doesn't exist yet, treat as empty and allow creating via save.
    if (e && e.status === 404) {
      return { key: 'academics', payload: EMPTY_ACADEMICS };
    }
    throw e;
  }
}

export async function saveAcademics(payload) {
  const safePayload = payload && typeof payload === 'object' ? payload : EMPTY_ACADEMICS;
  const res = await apiPut('/api/admin/app-data/academics', { payload: safePayload });
  return res;
}
