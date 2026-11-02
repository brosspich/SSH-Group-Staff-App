import { Router } from 'express';
import { auditController } from './audit.controller.js';
import { authGuard, requireRole } from '../../core/middlewares/authGuard.js';

const router = Router();

router.use(authGuard);
router.use(requireRole(['admin', 'manager']));

router.get('/', auditController.getLogs);
router.get('/:id', auditController.getById);

export const auditRoutes = router;
