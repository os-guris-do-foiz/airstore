import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', userController.getAll);
router.get('/:id', userController.getById);


router.patch('/:id/roles', authenticate, userController.updateRoles);
router.put('/:id/roles', authenticate, userController.updateRoles);

router.patch('/:id/status', authenticate, userController.updateStatus);
router.put('/:id/status', authenticate, userController.updateStatus);

export default router;