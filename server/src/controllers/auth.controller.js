import bcrypt from 'bcryptjs';
import { Student } from '../models/Student.js';
import { clearAuthCookie, setAuthCookie, signAuthToken } from '../middleware/auth.js';

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

    const student = await Student.findOne({
      $or: [{ email: normalizedEmail }, { studentId: id }],
    });

    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password.trim(), student.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signAuthToken({ sub: String(student._id) });
    setAuthCookie(res, token);

    return res.json({ student: toMePayload(student) });
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
    const studentId = req.auth?.sub;
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    const student = await Student.findById(studentId).lean();
    if (!student) return res.status(401).json({ message: 'Unauthorized' });

    res.json(toMePayload(student));
  } catch (err) {
    next(err);
  }
}
