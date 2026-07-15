import { Router } from 'express';
import * as teamController from '../controllers/team.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { rateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();
const media = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]);

const createLimiter = rateLimit(60 * 60 * 1000, 10, 'Você criou times demais em pouco tempo. Aguarde.');

router.get('/', teamController.getAll);
router.get('/mine', authenticate, teamController.getMine);

router.patch('/featured', authenticate, teamController.setFeatured);

router.get('/:id', teamController.getById);

router.post('/', authenticate, createLimiter, media, teamController.create);
router.put('/:id', authenticate, media, teamController.update);
router.delete('/:id', authenticate, teamController.remove);

router.post('/:id/announcement', authenticate, upload.single('image'), teamController.createAnnouncement);
router.put('/:id/announcement', authenticate, upload.single('image'), teamController.updateAnnouncement);
router.delete('/:id/announcement', authenticate, teamController.deleteAnnouncement);

router.post('/:id/join', authenticate, teamController.join);
router.patch('/:id/members/:memberId/approve', authenticate, teamController.approveMember);
router.patch('/:id/members/:memberId/role', authenticate, teamController.setMemberRole);
router.delete('/:id/members/:memberId', authenticate, teamController.removeMember);

export default router;
