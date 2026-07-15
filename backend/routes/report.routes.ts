import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload, MAX_IMAGES_PER_UPLOAD } from '../middlewares/upload.middleware';
import { rateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();

router.use(authenticate);

const createLimiter = rateLimit(60 * 60 * 1000, 10, 'Você enviou denúncias demais em pouco tempo. Aguarde.');

router.post('/', createLimiter, upload.array('images', MAX_IMAGES_PER_UPLOAD), reportController.createReport);
router.get('/', reportController.getAllReports);
router.get('/stats', reportController.getReportStats);
router.patch('/:id/status', reportController.updateReportStatus);

export default router;
