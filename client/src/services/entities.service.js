import { apiGet } from '../api/http';

// Generic API: GET /api/entities/:type?parentId=
export async function fetchEntities(type, parentId) {
  const safeType = encodeURIComponent(String(type || '').trim());
  const query = parentId ? `?parentId=${encodeURIComponent(String(parentId))}` : '';
  const res = await apiGet(`/api/entities/${safeType}${query}`);
  return Array.isArray(res?.items) ? res.items : [];
}
