import { Router } from 'express';
import {
  getCourses,
  getDashboard,
  getHelp,
  getKnowledgeHub,
  getMaterials,
  getPolicy,
  getProfile,
  getRecordings,
  getResults,
  getSchedule,
  getStudentMe,
} from '../controllers/lms.controller.js';

export const lmsRouter = Router();

lmsRouter.get('/student/me', getStudentMe);

lmsRouter.get('/dashboard', getDashboard);
lmsRouter.get('/courses', getCourses);
lmsRouter.get('/materials', getMaterials);
lmsRouter.get('/knowledge-hub', getKnowledgeHub);
lmsRouter.get('/schedule', getSchedule);
lmsRouter.get('/recordings', getRecordings);
lmsRouter.get('/results', getResults);
lmsRouter.get('/policy', getPolicy);
lmsRouter.get('/profile', getProfile);
lmsRouter.get('/help', getHelp);
