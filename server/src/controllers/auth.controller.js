import bcrypt from 'bcryptjs';
import { Student } from '../models/Student.js';
import { Admin } from '../models/Admin.js';
import { clearAuthCookie, setAuthCookie, signAuthToken } from '../middleware/auth.js';
import { DEFAULT_LMS_DATA } from '../data/defaultLmsData.js';
import { getOrCreateAppDataPayload } from '../services/appData.service.js';

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function safeTrim(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function isValidEmail(email) {
  // Simple, pragmatic validation.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeId(value) {
  if (value == null) return '';
  return String(value);
}

async function resolveInvite(intakeId, inviteToken) {
  const safeIntakeId = normalizeId(intakeId).trim();
  const safeToken = typeof inviteToken === 'string' ? inviteToken.trim() : '';

  if (!safeIntakeId) return null;
  if (!safeToken) return { error: 'Missing invite token' };

  const payload = await getOrCreateAppDataPayload('academics', DEFAULT_LMS_DATA.academics);
  const academics = payload && typeof payload === 'object' ? payload : DEFAULT_LMS_DATA.academics;
  const faculties = Array.isArray(academics?.faculties) ? academics.faculties : [];

  for (const faculty of faculties) {
    const facultyId = normalizeId(faculty?.id || faculty?._id || faculty?.name);
    const programs = Array.isArray(faculty?.programs) ? faculty.programs : [];
    for (const program of programs) {
      const programId = normalizeId(program?.id || program?._id || program?.name);
      const intakes = Array.isArray(program?.intakes) ? program.intakes : [];
      for (const intake of intakes) {
        const foundIntakeId = normalizeId(intake?.id || intake?._id || intake?.name);
        if (foundIntakeId !== safeIntakeId) continue;
        const expected = typeof intake?.inviteToken === 'string' ? intake.inviteToken : '';
        if (expected && expected === safeToken) {
          return { facultyId, programId, intakeId: safeIntakeId };
        }
        return { error: 'Invalid batch link' };
      }
    }
  }

  return { error: 'Invalid batch link' };
}

async function resolveBranchEnrollment(branchId, intakeId, batchId) {
  const safeBranchId = normalizeId(branchId).trim();
  const safeIntakeId = normalizeId(intakeId).trim();
  const safeBatchId = normalizeId(batchId).trim();

  if (!safeBranchId || !safeIntakeId || !safeBatchId) {
    return { error: 'Branch, intake, and batch are required' };
  }

  const payload = await getOrCreateAppDataPayload('academics', { branches: [] });
  const branches = Array.isArray(payload?.branches) ? payload.branches : [];

  const normalizedBranchId = normalizeId(safeBranchId);
  const normalizedIntakeId = normalizeId(safeIntakeId);
  const normalizedBatchId = normalizeId(safeBatchId);

  const branch = branches.find(
    (b) => normalizeId(b?.id || b?._id || b?.key || b?.code || b?.name) === normalizedBranchId
  );
  if (!branch) return { error: 'Invalid registration link' };

  const intakes = Array.isArray(branch?.intakes) ? branch.intakes : [];
  const intake = intakes.find(
    (i) => normalizeId(i?.id || i?._id || i?.key || i?.code || i?.name) === normalizedIntakeId
  );
  if (!intake) return { error: 'Invalid registration link' };

  const batches = Array.isArray(intake?.batches) ? intake.batches : [];
  const batch = batches.find(
    (b) => normalizeId(b?.id || b?._id || b?.key || b?.code || b?.name) === normalizedBatchId
  );
  if (!batch) return { error: 'Invalid registration link' };

  return { branchId: safeBranchId, intakeId: safeIntakeId, batchId: safeBatchId };
}

function toMePayload(student) {
  const fullName = student.fullName;
  const firstName = fullName.split(' ')[0] || fullName;

  return {
    id: String(student._id),
    name: fullName,
    firstName,
    email: student.email,
    studentId: student.studentId,
    nic: student.nic,
    course: student.course,
    whatsappNumber: student.whatsappNumber,
    phoneNumber: student.phoneNumber,
    address: student.address,
    guardianName: student.guardianName,
    guardianPhoneNumber: student.guardianPhoneNumber,

    branchId: student.branchId,
    batchId: student.batchId,

    facultyId: student.facultyId,
    programId: student.programId,
    intakeId: student.intakeId,
  };
}

function toLecturerPayload(lecturer) {
  return {
    id: String(lecturer._id),
    name: lecturer.name,
    email: lecturer.email,
    branchId: lecturer.branchId || '',
    subject: lecturer.subject || '',
    role: 'lecturer',
  };
}

export async function registerStudent(req, res, next) {
  try {
    const {
      fullName,
      email,
      studentId,
      nic,
      course,
      whatsappNumber,
      phoneNumber,
      address,
      guardianName,
      guardianPhoneNumber,
      password,
      branchId,
      batchId,
      intakeId,
      inviteToken,
    } = req.body || {};

    const normalizedEmail = normalizeEmail(email);

    if (!isNonEmptyString(fullName)) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!isNonEmptyString(studentId)) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!isNonEmptyString(password) || password.trim().length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await Student.findOne({
      $or: [{ email: normalizedEmail }, { studentId: safeTrim(studentId) }],
    }).lean();

    if (existing) {
      return res.status(409).json({ message: 'Email or Student ID already exists' });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 12);

    const wantsLegacyInvite = isNonEmptyString(inviteToken);
    const wantsBranchEnrollment = isNonEmptyString(branchId) || isNonEmptyString(batchId);

    let association = null;

    if (wantsLegacyInvite) {
      const invite = await resolveInvite(intakeId, inviteToken);
      if (invite?.error) {
        return res.status(400).json({ message: invite.error });
      }
      association = invite;
    } else if (wantsBranchEnrollment) {
      const enrollment = await resolveBranchEnrollment(branchId, intakeId, batchId);
      if (enrollment?.error) {
        return res.status(400).json({ message: enrollment.error });
      }
      association = enrollment;
    }

    const created = await Student.create({
      fullName: safeTrim(fullName),
      email: normalizedEmail,
      studentId: safeTrim(studentId),
      nic: safeTrim(nic),
      course: safeTrim(course),
      whatsappNumber: safeTrim(whatsappNumber),
      phoneNumber: safeTrim(phoneNumber),
      address: safeTrim(address),
      guardianName: safeTrim(guardianName),
      guardianPhoneNumber: safeTrim(guardianPhoneNumber),
      ...(association ? association : {}),
      passwordHash,
    });

    const token = signAuthToken({ sub: String(created._id) });
    setAuthCookie(res, token);

    return res.status(201).json({ student: toMePayload(created) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Email or Student ID already exists' });
    }
    next(err);
  }
}

export async function loginStudent(req, res, next) {
  try {
    const { identifier, password } = req.body || {};

    if (!isNonEmptyString(identifier) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    const id = identifier.trim();
    const normalizedEmail = normalizeEmail(id);

    // --- Check student first ---
    const student = await Student.findOne({
      $or: [{ email: normalizedEmail }, { studentId: id }],
    });

    if (student) {
      const ok = await bcrypt.compare(password.trim(), student.passwordHash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      const token = signAuthToken({ sub: String(student._id), role: 'student' });
      setAuthCookie(res, token);
      return res.json({ student: toMePayload(student) });
    }

    // --- Check lecturer ---
    const lecturer = await Admin.findOne({ email: normalizedEmail, role: 'lecturer' });

    if (lecturer) {
      const ok = await bcrypt.compare(password.trim(), lecturer.passwordHash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      const token = signAuthToken({ sub: String(lecturer._id), role: 'lecturer' });
      setAuthCookie(res, token);
      return res.json({
        lecturer: toLecturerPayload(lecturer),
        mustChangePassword: lecturer.mustChangePassword === true,
      });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    next(err);
  }
}

export async function logoutStudent(req, res, next) {
  try {
    clearAuthCookie(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function getAuthMe(req, res, next) {
  try {
    const id = req.auth?.sub;
    const role = req.auth?.role;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    if (role === 'lecturer') {
      const lecturer = await Admin.findById(id).lean();
      if (!lecturer || lecturer.role !== 'lecturer') {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      return res.json({ ...toLecturerPayload(lecturer), role: 'lecturer' });
    }

    const student = await Student.findById(id).lean();
    if (!student) return res.status(401).json({ message: 'Unauthorized' });

    res.json(toMePayload(student));
  } catch (err) {
    next(err);
  }
}

export async function changeLecturerPassword(req, res, next) {
  try {
    const id = req.auth?.sub;
    const role = req.auth?.role;
    if (!id || role !== 'lecturer') return res.status(403).json({ message: 'Forbidden' });

    const { newPassword } = req.body || {};
    if (!isNonEmptyString(newPassword) || newPassword.trim().length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const passwordHash = await bcrypt.hash(newPassword.trim(), 12);
    await Admin.findByIdAndUpdate(id, { passwordHash, mustChangePassword: false });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
