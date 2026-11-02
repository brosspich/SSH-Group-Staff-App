import { Router } from 'express';
import { sshGroupController } from './ssh-group.controller.js';
import { authGuard, requireRole } from '../../core/middlewares/authGuard.js';
import { validateBody } from '../../core/middlewares/validateBody.js';
import { createSshGroupSchema, updateSshGroupSchema } from './ssh-group.schema.js';

const router = Router();

router.use(authGuard);

router.get('/', sshGroupController.getAll);
router.get('/:id', sshGroupController.getById);
router.post(
  '/',
  requireRole(['admin', 'manager']),
  validateBody(createSshGroupSchema),
  sshGroupController.create
);
router.put(
  '/:id',
  requireRole(['admin', 'manager']),
  validateBody(updateSshGroupSchema),
  sshGroupController.update
);
router.delete('/:id', requireRole(['admin']), sshGroupController.delete);

export const sshGroupRoutes = router;
