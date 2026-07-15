import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id', optionalAuthenticate, eventController.getById);

router.patch('/:id/status', authenticate, eventController.updateStatus);
router.put('/:id/status', authenticate, eventController.updateStatus);

router.post('/:id/join', optionalAuthenticate, eventController.join);

router.delete('/:id/participants/:pid', authenticate, eventController.leave);
router.delete('/:id', authenticate, eventController.remove);

export default router;
