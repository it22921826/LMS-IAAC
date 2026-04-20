import { DEFAULT_LMS_DATA } from '../data/defaultLmsData.js';
import { getOrCreateAppDataPayload } from '../services/appData.service.js';

function normalizeId(value) {
  if (value == null) return '';
  return String(value);
}

function normalizeName(value) {
  if (typeof value === 'string') return value;
  return '';
}

function toOption(node) {
  const id = normalizeId(node?.id || node?._id || node?.key || node?.code || node?.name);
  const name = normalizeName(node?.name || node?.title || node?.label);
  return { id, name };
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
    if (program) return program;
  }
  return null;
}

function findIntake(payload, intakeId) {
  const faculties = Array.isArray(payload?.faculties) ? payload.faculties : [];
  for (const faculty of faculties) {
    const programs = Array.isArray(faculty?.programs) ? faculty.programs : [];
    for (const program of programs) {
      const intakes = Array.isArray(program?.intakes) ? program.intakes : [];
      const intake = intakes.find((i) => normalizeId(i?.id || i?._id || i?.name) === normalizeId(intakeId));
      if (intake) return intake;
    }
  }
  return null;
}

export async function listFaculties(req, res, next) {
  try {
    const payload = await getAcademicsPayload();
    const faculties = Array.isArray(payload?.faculties) ? payload.faculties : [];
    res.json({ items: faculties.map(toOption).filter((o) => o.id && o.name) });
  } catch (err) {
    next(err);
  }
}

export async function listPrograms(req, res, next) {
  try {
    const facultyId = req.query.facultyId;
    if (!facultyId) return res.status(400).json({ message: 'facultyId is required' });

    const payload = await getAcademicsPayload();
    const faculty = findFaculty(payload, facultyId);
    const programs = Array.isArray(faculty?.programs) ? faculty.programs : [];

    res.json({ items: programs.map(toOption).filter((o) => o.id && o.name) });
  } catch (err) {
    next(err);
  }
}

export async function listIntakes(req, res, next) {
  try {
    const programId = req.query.programId;
    if (!programId) return res.status(400).json({ message: 'programId is required' });

    const payload = await getAcademicsPayload();
    const program = findProgram(payload, programId);
    const intakes = Array.isArray(program?.intakes) ? program.intakes : [];

    res.json({ items: intakes.map(toOption).filter((o) => o.id && o.name) });
  } catch (err) {
    next(err);
  }
}

export async function listSubjects(req, res, next) {
  try {
    const intakeId = req.query.intakeId;
    if (!intakeId) return res.status(400).json({ message: 'intakeId is required' });

    const payload = await getAcademicsPayload();
    const intake = findIntake(payload, intakeId);
    const subjects = Array.isArray(intake?.subjects) ? intake.subjects : [];

    res.json({ items: subjects.map(toOption).filter((o) => o.id && o.name) });
  } catch (err) {
    next(err);
  }
}
