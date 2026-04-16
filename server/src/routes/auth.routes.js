import { Router } from 'express';
import { getAuthMe, loginStudent, logoutStudent, registerStudent } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', registerStudent);
authRouter.post('/login', loginStudent);
authRouter.post('/logout', logoutStudent);
authRouter.get('/me', requireAuth, getAuthMe);
