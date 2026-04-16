import { Router } from 'express';
import {
  createStudentByAdmin,
  getAdminMetrics,
  getAppDataByKey,
  listAppDataKeys,
  listStudents,
  upsertAppDataByKey,
} from '../controllers/admin.controller.js';

export const adminRouter = Router();

adminRouter.get('/metrics', getAdminMetrics);

adminRouter.get('/students', listStudents);
adminRouter.post('/students', createStudentByAdmin);

adminRouter.get('/app-data/keys', listAppDataKeys);
adminRouter.get('/app-data/:key', getAppDataByKey);
adminRouter.put('/app-data/:key', upsertAppDataByKey);
