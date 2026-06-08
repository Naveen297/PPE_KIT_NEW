import { Router } from 'express';
import { DetectionController } from '../controllers/detection.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import { detectionSchemas } from '../validators/detection.validator';

const router = Router();
const detectionController = new DetectionController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/detections
 * @desc    Get all detections with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  validateRequest(detectionSchemas.getDetections, 'query'),
  detectionController.getDetections
);

/**
 * @route   GET /api/v1/detections/:id
 * @desc    Get single detection by ID
 * @access  Private
 */
router.get('/:id', detectionController.getDetectionById);

/**
 * @route   POST /api/v1/detections
 * @desc    Create new detection (from AI model)
 * @access  Private (Operator, Supervisor, Admin)
 */
router.post(
  '/',
  authorize('operator', 'supervisor', 'admin'),
  validateRequest(detectionSchemas.createDetection),
  detectionController.createDetection
);

/**
 * @route   PUT /api/v1/detections/:id/review
 * @desc    Review a detection
 * @access  Private (Supervisor, Admin)
 */
router.put(
  '/:id/review',
  authorize('supervisor', 'admin'),
  validateRequest(detectionSchemas.reviewDetection),
  detectionController.reviewDetection
);

/**
 * @route   DELETE /api/v1/detections/:id
 * @desc    Delete a detection (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authorize('admin'),
  detectionController.deleteDetection
);

/**
 * @route   GET /api/v1/detections/stats/summary
 * @desc    Get detection statistics summary
 * @access  Private
 */
router.get(
  '/stats/summary',
  detectionController.getDetectionStats
);

/**
 * @route   GET /api/v1/detections/plant/:plantId
 * @desc    Get detections for a specific plant
 * @access  Private
 */
router.get(
  '/plant/:plantId',
  validateRequest(detectionSchemas.getDetections, 'query'),
  detectionController.getDetectionsByPlant
);

export default router;
