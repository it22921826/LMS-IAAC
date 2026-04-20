import { Router } from 'express';
import { listEntities } from '../controllers/entities.controller.js';

export const entitiesRouter = Router();

// Generic hierarchical endpoint
// GET /api/entities/:type?parentId=...
entitiesRouter.get('/:type', listEntities);
