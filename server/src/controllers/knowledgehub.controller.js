import fs from 'fs';
import path from 'path';
import { Admin } from '../models/Admin.js';
import { KnowledgeHubItem } from '../models/KnowledgeHubItem.js';
import { Student } from '../models/Student.js';

const ALLOWED_FILE_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'text/plain',
]);
const ALLOWED_FILE_EXTS = new Set(['.pdf', '.docx', '.pptx', '.xlsx', '.zip', '.doc', '.xls', '.ppt', '.txt']);

function normalizeId(v) { return v == null ? '' : String(v).trim(); }
function safeStr(v, max = 300) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}
function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch { return false; }
}

function toItem(d) {
  return {
    id: String(d._id),
    branchId: d.branchId,
    intakeId: d.intakeId,
    batchId:  d.batchId,
    resourceType: d.resourceType,
    title:       d.title,
    description: d.description || '',
    hasFile:    Boolean(d.filePath),
    fileName:   d.fileName || '',
    fileSize:   d.fileSize || 0,
    contentUrl: d.contentUrl || '',
    textContent: d.textContent || '',
    addedBy:     d.addedBy,
    addedByName: d.addedByName,
    addedByRole: d.addedByRole,
    createdAt:  d.createdAt,
  };
}

async function resolveUserBatch(auth) {
  if (auth?.role === 'lecturer') {
    const l = await Admin.findById(auth.sub).lean();
    return l ? { branchId: l.branchId, intakeId: l.intakeId, batchId: l.batchId, name: l.name, role: 'lecturer', id: String(l._id) } : null;
  }
  const s = await Student.findById(auth.sub).lean();
  return s ? { branchId: s.branchId, intakeId: s.intakeId, batchId: s.batchId, role: 'student', id: String(s._id) } : null;
}

// ─── STUDENT / LECTURER: list items for their batch ──────────────────────────
export async function listMyHubItems(req, res, next) {
  try {
    const user = await resolveUserBatch(req.auth);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!user.batchId) return res.json({ items: [] });

    const items = await KnowledgeHubItem.find({ batchId: normalizeId(user.batchId) })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items: items.map(toItem) });
  } catch (err) { next(err); }
}

// ─── STUDENT: download a file resource ───────────────────────────────────────
export async function studentDownloadResource(req, res, next) {
  try {
    const student = await Student.findById(req.auth.sub).lean();
    if (!student) return res.status(401).json({ message: 'Unauthorized' });

    const item = await KnowledgeHubItem.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: 'Resource not found' });

    if (normalizeId(item.batchId) !== normalizeId(student.batchId)) {
      return res.status(403).json({ message: 'This resource is not available for your batch.' });
    }
    if (!item.filePath) return res.status(404).json({ message: 'No file attached' });

    const absPath = path.resolve(item.filePath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ message: 'File not found' });

    res.download(absPath, item.fileName || 'download');
  } catch (err) { next(err); }
}

// ─── LECTURER: add resource ───────────────────────────────────────────────────
export async function lecturerAddHubItem(req, res, next) {
  try {
    const lecturer = await Admin.findById(req.auth.sub).lean();
    if (!lecturer || lecturer.role !== 'lecturer') return res.status(403).json({ message: 'Forbidden' });

    const { resourceType, title, description, contentUrl, textContent, batchId, intakeId } = req.body || {};

    const validTypes = ['file', 'link', 'video', 'note'];
    if (!validTypes.includes(resourceType)) {
      return res.status(400).json({ message: 'Invalid resource type. Use: file, link, video, note' });
    }
    if (!safeStr(title)) return res.status(400).json({ message: 'Title is required' });

    const targetBatchId  = normalizeId(batchId)  || normalizeId(lecturer.batchId);
    const targetIntakeId = normalizeId(intakeId) || normalizeId(lecturer.intakeId);
    const targetBranchId = normalizeId(lecturer.branchId);

    if (!targetBatchId) return res.status(400).json({ message: 'No batch assigned to your account' });

    if (normalizeId(lecturer.batchId) && targetBatchId !== normalizeId(lecturer.batchId)) {
      return res.status(403).json({ message: 'You can only add resources for your assigned batch' });
    }

    let filePath = '', fileName = '', fileSize = 0, fileMime = '';

    if (resourceType === 'file') {
      if (!req.file) return res.status(400).json({ message: 'File is required for type "file"' });
      if (!ALLOWED_FILE_MIMES.has(req.file.mimetype)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Invalid file type. Only PDF, DOCX, PPTX, XLSX, ZIP allowed.' });
      }
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!ALLOWED_FILE_EXTS.has(ext)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Invalid file extension.' });
      }
      filePath = req.file.path;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileMime = req.file.mimetype;
    } else if (resourceType === 'link' || resourceType === 'video') {
      if (!contentUrl || !isValidUrl(contentUrl)) {
        return res.status(400).json({ message: 'A valid URL is required for type "link" or "video"' });
      }
    } else if (resourceType === 'note') {
      if (!safeStr(textContent || '', 20000)) {
        return res.status(400).json({ message: 'Note content is required' });
      }
    }

    const created = await KnowledgeHubItem.create({
      branchId: targetBranchId,
      intakeId: targetIntakeId,
      batchId:  targetBatchId,
      resourceType,
      title:       safeStr(title),
      description: safeStr(description || '', 1000),
      filePath, fileName, fileSize, fileMime,
      contentUrl:  contentUrl ? safeStr(contentUrl, 1000) : '',
      textContent: textContent ? safeStr(textContent, 20000) : '',
      addedBy:     String(lecturer._id),
      addedByName: lecturer.name,
      addedByRole: 'lecturer',
    });

    res.status(201).json({ item: toItem(created) });
  } catch (err) { next(err); }
}

// ─── LECTURER: delete own resource ───────────────────────────────────────────
export async function lecturerDeleteHubItem(req, res, next) {
  try {
    const item = await KnowledgeHubItem.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: 'Resource not found' });

    if (String(item.addedBy) !== String(req.auth.sub)) {
      return res.status(403).json({ message: 'You can only delete your own resources' });
    }

    if (item.filePath && fs.existsSync(item.filePath)) fs.unlinkSync(item.filePath);
    await KnowledgeHubItem.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── ADMIN: list all resources ────────────────────────────────────────────────
export async function adminListHubItems(req, res, next) {
  try {
    const { batchId } = req.query;
    const filter = {};
    if (batchId) filter.batchId = normalizeId(batchId);

    const items = await KnowledgeHubItem.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ items: items.map(toItem) });
  } catch (err) { next(err); }
}

// ─── ADMIN: add resource to any batch ────────────────────────────────────────
export async function adminAddHubItem(req, res, next) {
  try {
    const { resourceType, title, description, contentUrl, textContent, branchId, intakeId, batchId } = req.body || {};

    const validTypes = ['file', 'link', 'video', 'note'];
    if (!validTypes.includes(resourceType)) return res.status(400).json({ message: 'Invalid resource type' });
    if (!safeStr(title)) return res.status(400).json({ message: 'Title is required' });
    if (!normalizeId(branchId)) return res.status(400).json({ message: 'Branch is required' });
    if (!normalizeId(batchId))  return res.status(400).json({ message: 'Batch is required' });

    let filePath = '', fileName = '', fileSize = 0, fileMime = '';
    if (resourceType === 'file') {
      if (!req.file) return res.status(400).json({ message: 'File is required' });
      if (!ALLOWED_FILE_MIMES.has(req.file.mimetype)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Invalid file type' });
      }
      filePath = req.file.path;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileMime = req.file.mimetype;
    } else if (resourceType === 'link' || resourceType === 'video') {
      if (!contentUrl || !isValidUrl(contentUrl)) return res.status(400).json({ message: 'Valid URL required' });
    } else if (resourceType === 'note') {
      if (!safeStr(textContent || '', 20000)) return res.status(400).json({ message: 'Note content required' });
    }

    const adminId = String(req.adminAuth?.sub || req.adminAuth?.id || '');
    const adminDoc = adminId ? await Admin.findById(adminId).select('name').lean() : null;
    const adminName = adminDoc?.name || 'Admin';

    const created = await KnowledgeHubItem.create({
      branchId: normalizeId(branchId),
      intakeId: normalizeId(intakeId || ''),
      batchId:  normalizeId(batchId),
      resourceType,
      title:       safeStr(title),
      description: safeStr(description || '', 1000),
      filePath, fileName, fileSize, fileMime,
      contentUrl:  contentUrl ? safeStr(contentUrl, 1000) : '',
      textContent: textContent ? safeStr(textContent, 20000) : '',
      addedBy:     adminId,
      addedByName: adminName,
      addedByRole: 'superadmin',
    });

    res.status(201).json({ item: toItem(created) });
  } catch (err) { next(err); }
}

// ─── ADMIN: delete any resource ───────────────────────────────────────────────
export async function adminDeleteHubItem(req, res, next) {
  try {
    const item = await KnowledgeHubItem.findByIdAndDelete(req.params.id).lean();
    if (!item) return res.status(404).json({ message: 'Resource not found' });
    if (item.filePath && fs.existsSync(item.filePath)) fs.unlinkSync(item.filePath);
    res.json({ ok: true });
  } catch (err) { next(err); }
}
