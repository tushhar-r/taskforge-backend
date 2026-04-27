// ---------------------------------------------------------
// Centralised route registry
// ---------------------------------------------------------

import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import teamRoutes from './team.routes';
import clientRoutes from './client.routes';
import timesheetRoutes from './timesheet.routes';
import roleRoutes from './role.routes';

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
router.use('/teams', teamRoutes);
router.use('/clients', clientRoutes);
router.use('/timesheet', timesheetRoutes);
router.use('/roles', roleRoutes);

export default router;
