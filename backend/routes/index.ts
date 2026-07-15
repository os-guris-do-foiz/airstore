import { Router } from 'express';
import authRoutes from './auth.routes';

import userRoutes from './user.routes';
import adRoutes from './ad.routes';
import reportRoutes from './report.routes';
import fieldRoutes from './field.routes';
import eventRoutes from './event.routes';
import notificationRoutes from './notification.routes';
import teamRoutes from './team.routes';
import donationRoutes from './donation.routes';
import favoriteRoutes from './favorite.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ads', adRoutes);
router.use('/reports', reportRoutes);
router.use('/fields', fieldRoutes);
router.use('/events', eventRoutes);
router.use('/notifications', notificationRoutes);
router.use('/teams', teamRoutes);
router.use('/donations', donationRoutes);
router.use('/favorites', favoriteRoutes);

export default router;