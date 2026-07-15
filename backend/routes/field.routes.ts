import { Router } from 'express';
import * as fieldController from '../controllers/field.controller';
import * as eventController from '../controllers/event.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.middleware';
import { upload, MAX_IMAGES_PER_UPLOAD } from '../middlewares/upload.middleware';
import { rateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();

const createEventLimiter = rateLimit(60 * 60 * 1000, 20, 'Você criou partidas demais em pouco tempo. Aguarde.');

router.get('/', fieldController.getAll);

router.get('/stats', authenticate, authorize(['ADMIN']), fieldController.getStats);
router.get('/mine', authenticate, fieldController.getMine);

router.get('/:id', fieldController.getById);

router.get('/:id/events', optionalAuthenticate, eventController.listByField);
router.post('/:id/events', authenticate, createEventLimiter, eventController.create);

router.post('/', authenticate, upload.fields([{ name: 'images', maxCount: MAX_IMAGES_PER_UPLOAD }, { name: 'cover', maxCount: 1 }]), fieldController.create);
router.put('/:id', authenticate, upload.fields([{ name: 'images', maxCount: MAX_IMAGES_PER_UPLOAD }, { name: 'cover', maxCount: 1 }]), fieldController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), fieldController.remove);

export default router;
