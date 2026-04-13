// ---------------------------------------------------------
// Centralised route registry
// ---------------------------------------------------------

import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import taskRoutes from './task.routes';

const router = Router();

// Health check (useful for load balancers / k8s probes)
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: { status: 'healthy', timestamp: new Date().toISOString() },
    message: 'Service is running',
  });
});

// Mount feature routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);

export default router;
