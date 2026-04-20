import { DEFAULT_LMS_DATA } from '../data/defaultLmsData.js';
import { getOrCreateAppDataPayload } from '../services/appData.service.js';

function normalizeId(value) {
  if (value == null) return '';
  return String(value);
}

function toOption(node, parentId = null) {
  const id = normalizeId(node?.id || node?._id || node?.key || node?.code || node?.name);
  const name = typeof node?.name === 'string' ? node.name : typeof node?.title === 'string' ? node.title : '';
  const inviteToken = node?.inviteToken ? String(node.inviteToken) : '';
  return {
    id,
    name,
    parentId: parentId ? normalizeId(parentId) : null,
    ...(inviteToken ? { inviteToken } : {}),
  };
}

async function getAcademicsPayload() {
  const payload = await getOrCreateAppDataPayload('academics', DEFAULT_LMS_DATA.academics);
  return payload && typeof payload === 'object' ? payload : DEFAULT_LMS_DATA.academics;
}

function findFaculty(payload, facultyId) {
  const faculties = Array.isArray(payload?.faculties) ? payload.faculties : [];
  return faculties.find((f) => normalizeId(f?.id || f?._id || f?.name) === normalizeId(facultyId));
}

function findProgram(payload, programId) {
  const faculties = Array.isArray(payload?.faculties) ? payload.faculties : [];
  for (const faculty of faculties) {
    const programs = Array.isArray(faculty?.programs) ? faculty.programs : [];
    const program = programs.find((p) => normalizeId(p?.id || p?._id || p?.name) === normalizeId(programId));
    if (program) return { program, facultyId: normalizeId(faculty?.id || faculty?._id || faculty?.name) };
  }
  return null;
}

export async function listEntities(req, res, next) {
  try {
    const type = String(req.params.type || '').toLowerCase();
    const parentId = req.query.parentId ? String(req.query.parentId) : '';

    const payload = await getAcademicsPayload();

    if (type === 'faculties') {
      const faculties = Array.isArray(payload?.faculties) ? payload.faculties : [];
      return res.json({ items: faculties.map((f) => toOption(f)) });
    }

    if (type === 'programs') {
      if (!parentId) return res.status(400).json({ message: 'parentId is required for programs' });
      const faculty = findFaculty(payload, parentId);
      const programs = Array.isArray(faculty?.programs) ? faculty.programs : [];
      return res.json({ items: programs.map((p) => toOption(p, parentId)) });
    }

    if (type === 'intakes') {
      if (!parentId) return res.status(400).json({ message: 'parentId is required for intakes' });
      const found = findProgram(payload, parentId);
      const intakes = Array.isArray(found?.program?.intakes) ? found.program.intakes : [];
      return res.json({ items: intakes.map((i) => toOption(i, parentId)) });
    }

    return res.status(400).json({ message: 'Invalid type. Use faculties|programs|intakes' });
  } catch (err) {
    next(err);
  }
}
