import { Router } from 'express';
import authRoutes from './auth.routes';
import plantRoutes from './plant.routes';
import detectionRoutes from './detection.routes';
import incidentRoutes from './incident.routes';
import alertRoutes from './alert.routes';
import reportRoutes from './report.routes';
import userRoutes from './user.routes';
import dashboardRoutes from './dashboard.routes';
import { config } from '../config';

const router = Router();

// API version prefix
const API_VERSION = `/${config.apiVersion}`;

// Health check for API
router.get(`${API_VERSION}/`, (req, res) => {
  res.json({
    success: true,
    message: 'PPE Detection System API',
    version: config.apiVersion,
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/plants`, plantRoutes);
router.use(`${API_VERSION}/detections`, detectionRoutes);
router.use(`${API_VERSION}/incidents`, incidentRoutes);
router.use(`${API_VERSION}/alerts`, alertRoutes);
router.use(`${API_VERSION}/reports`, reportRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/dashboard`, dashboardRoutes);

export default router;
