import { Router } from 'express';
import { requireAdminForAppDataKey, requireAdminRole } from '../middleware/adminAuth.js';
import {
  createStudentByAdmin,
  createStaffUser,
  getAdminMetrics,
  getAppDataByKey,
  listAdminUsers,
  listAppDataKeys,
  listStudents,
  upsertAppDataByKey,
} from '../controllers/admin.controller.js';
import {
  listFaculties,
  listIntakes,
  listPrograms,
  listSubjects,
} from '../controllers/academics.controller.js';

export const adminRouter = Router();

adminRouter.get('/metrics', requireAdminRole(['superadmin', 'staff']), getAdminMetrics);

// Admin users (superadmin only)
adminRouter.get('/users', requireAdminRole('superadmin'), listAdminUsers);
adminRouter.post('/users', requireAdminRole('superadmin'), createStaffUser);

adminRouter.get('/students', requireAdminRole(['superadmin', 'staff']), listStudents);
adminRouter.post('/students', requireAdminRole(['superadmin', 'staff']), createStudentByAdmin);

adminRouter.get('/app-data/keys', requireAdminRole('superadmin'), listAppDataKeys);
adminRouter.get('/app-data/:key', requireAdminForAppDataKey({ mode: 'read' }), getAppDataByKey);
adminRouter.put('/app-data/:key', requireAdminForAppDataKey({ mode: 'write' }), upsertAppDataByKey);

// Academics (cascading select options)
adminRouter.get('/academics/faculties', requireAdminRole(['superadmin', 'staff']), listFaculties);
adminRouter.get('/academics/programs', requireAdminRole(['superadmin', 'staff']), listPrograms);
adminRouter.get('/academics/intakes', requireAdminRole(['superadmin', 'staff']), listIntakes);
adminRouter.get('/academics/subjects', requireAdminRole(['superadmin', 'staff']), listSubjects);
