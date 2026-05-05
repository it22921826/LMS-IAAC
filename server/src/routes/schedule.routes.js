import { Router } from 'express';
import { requireAdmin, requireAdminRole } from '../middleware/adminAuth.js';
import { requireAuth } from '../middleware/auth.js';
import {
  adminListSchedules,
  adminCreateSchedule,
  adminUpdateSchedule,
  adminDeleteSchedule,
  adminGetBranchLecturers,
  getMySchedule,
} from '../controllers/schedule.controller.js';

export const scheduleAdminRouter = Router();
export const scheduleRouter = Router();

// ─── Admin routes (mounted under /api/admin/schedule, protected by requireAdmin) ───
scheduleAdminRouter.get('/', adminListSchedules);
scheduleAdminRouter.post('/', requireAdminRole(['superadmin', 'staff']), adminCreateSchedule);
scheduleAdminRouter.put('/:id', requireAdminRole(['superadmin']), adminUpdateSchedule);
scheduleAdminRouter.delete('/:id', requireAdminRole(['superadmin']), adminDeleteSchedule);
scheduleAdminRouter.get('/lecturers', adminGetBranchLecturers);

// ─── Student/Lecturer routes (mounted under /api/schedule, protected by requireAuth) ───
scheduleRouter.get('/', requireAuth, getMySchedule);
