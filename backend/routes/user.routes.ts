import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', optionalAuthenticate, userController.getAll);
router.get('/stats', authenticate, authorize(['ADMIN']), userController.getStats);
router.get('/:id', optionalAuthenticate, userController.getById);
router.get('/:id/ads', userController.getAds);

router.put('/:id/profile', authenticate, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), userController.updateProfile);

router.post('/:id/reviews', authenticate, userController.addReview);
router.put('/:id/reviews', authenticate, userController.editReview);
router.delete('/:id/reviews/:reviewId', authenticate, userController.deleteReview);

router.patch('/:id/roles', authenticate, authorize(['ADMIN']), userController.updateRoles);
router.put('/:id/roles', authenticate, authorize(['ADMIN']), userController.updateRoles);

router.patch('/:id/status', authenticate, authorize(['ADMIN']), userController.updateStatus);
router.put('/:id/status', authenticate, authorize(['ADMIN']), userController.updateStatus);

export default router;