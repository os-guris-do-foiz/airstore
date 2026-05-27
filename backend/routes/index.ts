import { Router } from "express";

import authRoutes from './auth.routes';
import adRoutes from './ad.routes';
import userRoutes from './user.routes';
import reportRoutes from './report.routes';

const router = Router();


router.get("/ping", (req, res) => {
  res.json({ 
    status: "Operante", 
    message: "O Fronteira Airsoft está rodando liso no TypeORM!" 
  });
});


router.use('/auth', authRoutes);
router.use('/ads', adRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);

export default router;