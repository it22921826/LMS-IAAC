import { DEFAULT_LMS_DATA } from '../data/defaultLmsData.js';
import { AppData } from '../models/AppData.js';
import { Student } from '../models/Student.js';
import { getOrCreateAppDataPayload } from '../services/appData.service.js';

export async function getStudentMe(req, res, next) {
  try {
    const id = req.auth?.sub;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    const student = await Student.findById(id).lean();
    if (!student) return res.status(401).json({ message: 'Unauthorized' });

    const fullName = student.fullName;
    const firstName = fullName.split(' ')[0] || fullName;

    res.json({
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
    });
  } catch (err) {
    next(err);
  }
}

function normalizeDashboardPayload(payload) {
  const seed = DEFAULT_LMS_DATA.dashboard;

  const next = {
    ...payload,
    student: payload?.student ?? seed.student,
    progress: payload?.progress ?? seed.progress,
    notifications: payload?.notifications,
    activeMaterial: payload?.activeMaterial,
  };

  if (!Array.isArray(next.notifications)) {
    if (Array.isArray(payload?.news)) {
      next.notifications = payload.news.map((n, idx) => ({
        id: `news-${idx + 1}`,
        type: 'info',
        title: n.title,
        message: n.snippet,
        date: n.date,
      }));
    } else {
      next.notifications = seed.notifications;
    }
  }

  if (!next.activeMaterial) {
    const first = Array.isArray(payload?.materials) ? payload.materials[0] : null;
    next.activeMaterial = first
      ? {
          id: first.id,
          name: first.name,
          type: first.type,
          resumeHref: '/materials',
        }
      : seed.activeMaterial;
  }

  return next;
}

export async function getDashboard(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('dashboard', DEFAULT_LMS_DATA.dashboard);
    const normalized = normalizeDashboardPayload(payload);

    const needsPatch =
      !payload?.progress ||
      !Array.isArray(payload?.notifications) ||
      !payload?.activeMaterial;

    if (needsPatch) {
      await AppData.updateOne({ key: 'dashboard' }, { $set: { payload: normalized } });
    }

    res.json(normalized);
  } catch (err) {
    next(err);
  }
}

export async function getCourses(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('courses', DEFAULT_LMS_DATA.courses);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function getMaterials(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('materials', DEFAULT_LMS_DATA.materials);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function getKnowledgeHub(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('knowledge-hub', DEFAULT_LMS_DATA['knowledge-hub']);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function getSchedule(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('schedule', DEFAULT_LMS_DATA.schedule);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function getRecordings(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('recordings', DEFAULT_LMS_DATA.recordings);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function getResults(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('results', DEFAULT_LMS_DATA.results);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function getPolicy(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('policy', DEFAULT_LMS_DATA.policy);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('profile', DEFAULT_LMS_DATA.profile);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function getHelp(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('help', DEFAULT_LMS_DATA.help);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}
