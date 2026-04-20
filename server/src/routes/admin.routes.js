import { Router } from 'express';
import {
  createStudentByAdmin,
  getAdminMetrics,
  getAppDataByKey,
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

adminRouter.get('/metrics', getAdminMetrics);

adminRouter.get('/students', listStudents);
adminRouter.post('/students', createStudentByAdmin);

adminRouter.get('/app-data/keys', listAppDataKeys);
adminRouter.get('/app-data/:key', getAppDataByKey);
adminRouter.put('/app-data/:key', upsertAppDataByKey);

// Academics (cascading select options)
adminRouter.get('/academics/faculties', listFaculties);
adminRouter.get('/academics/programs', listPrograms);
adminRouter.get('/academics/intakes', listIntakes);
adminRouter.get('/academics/subjects', listSubjects);
