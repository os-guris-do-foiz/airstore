import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de denúncia exigem autenticação
router.use(authenticate);

router.post('/', reportController.createReport);
router.get('/', reportController.getAllReports);
router.patch('/:id/status', reportController.updateReportStatus);

export default router;
