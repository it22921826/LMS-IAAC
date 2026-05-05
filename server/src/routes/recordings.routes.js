import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAdmin, requireAdminRole } from '../middleware/adminAuth.js';
import { requireAuth, requireLecturer } from '../middleware/auth.js';
import {
  studentListRecordings,
  studentStreamRecording,
  lecturerListRecordings,
  lecturerUploadRecording,
  lecturerDeleteRecording,
  adminListRecordings,
  adminStreamRecording,
  adminDeleteRecording,
  adminUploadRecording,
} from '../controllers/recordings.controller.js';

// ─── Multer for video uploads ─────────────────────────────────────────────────
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/recordings/'),
  filename: (req, file, cb) => {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `rec-${suffix}${path.extname(file.originalname)}`);
  },
});
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB
});

export const recordingsRouter      = Router();  // public (student/lecturer) routes
export const recordingsAdminRouter = Router();  // admin routes

// ─── Student routes ───────────────────────────────────────────────────────────
recordingsRouter.get('/', requireAuth, studentListRecordings);
recordingsRouter.get('/stream/:id', requireAuth, studentStreamRecording);

// ─── Lecturer routes ──────────────────────────────────────────────────────────
recordingsRouter.get('/lecturer', requireAuth, requireLecturer, lecturerListRecordings);
recordingsRouter.post('/lecturer', requireAuth, requireLecturer, videoUpload.single('video'), lecturerUploadRecording);
recordingsRouter.delete('/lecturer/:id', requireAuth, requireLecturer, lecturerDeleteRecording);

// ─── Admin routes (mounted under /api/admin/recordings, protected by requireAdmin) ───
recordingsAdminRouter.get('/', adminListRecordings);
recordingsAdminRouter.get('/stream/:id', adminStreamRecording);
recordingsAdminRouter.post('/', requireAdminRole(['superadmin']), videoUpload.single('video'), adminUploadRecording);
recordingsAdminRouter.delete('/:id', requireAdminRole(['superadmin']), adminDeleteRecording);
