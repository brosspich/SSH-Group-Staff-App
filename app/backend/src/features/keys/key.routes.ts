import { Router } from 'express';
import { keyController } from './key.controller.js';
import { authGuard } from '../../core/middlewares/authGuard.js';
import { validateBody } from '../../core/middlewares/validateBody.js';
import { uploadKeySchema } from './key.schema.js';

const router = Router();

router.use(authGuard);

router.get('/', keyController.getMyKeys);
router.post('/', validateBody(uploadKeySchema), keyController.uploadKey);
router.delete('/:id', keyController.revokeKey);

export const keyRoutes = router;
