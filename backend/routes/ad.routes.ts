import { Router } from 'express';
import * as adController from '../controllers/ad.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload, MAX_IMAGES_PER_UPLOAD } from '../middlewares/upload.middleware';
import { rateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();

const createLimiter = rateLimit(60 * 60 * 1000, 30, 'Você criou anúncios demais em pouco tempo. Aguarde.');

router.get('/', adController.getAll);
router.get('/spotlight', adController.getSpotlight);
router.get('/:id', adController.getById);
router.post('/:id/view', adController.registerView);

router.post('/', authenticate, createLimiter, upload.array('images', MAX_IMAGES_PER_UPLOAD), adController.create);
router.put('/:id', authenticate, upload.array('images', MAX_IMAGES_PER_UPLOAD), adController.update);
router.delete('/:id', authenticate, adController.deleteAd);

export default router;