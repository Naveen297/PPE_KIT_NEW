import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { DetectionService } from '../services/detection.service';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

export class DetectionController {
  private detectionService: DetectionService;

  constructor() {
    this.detectionService = new DetectionService();
  }

  /**
   * Get all detections with filtering
   */
  getDetections = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      page = 1,
      limit = 20,
      status,
      plantId,
      zoneId,
      cameraId,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'DESC',
    } = req.query;

    const filters = {
      status: status as string,
      plantId: plantId as string,
      zoneId: zoneId as string,
      cameraId: cameraId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    };

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'ASC' | 'DESC',
    };

    const result = await this.detectionService.getDetections(filters, pagination);

    res.status(200).json({
      success: true,
      message: 'Detections retrieved successfully',
      data: result.detections,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
      },
    });
  });

  /**
   * Get detection by ID
   */
  getDetectionById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const detection = await this.detectionService.getDetectionById(id);

    if (!detection) {
      throw new AppError('Detection not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Detection retrieved successfully',
      data: detection,
    });
  });

  /**
   * Create new detection
   */
  createDetection = asyncHandler(async (req: AuthRequest, res: Response) => {
    const detectionData = req.body;
    const userId = req.user?.id;

    const detection = await this.detectionService.createDetection(detectionData, userId);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`plant-${detection.plant_id}`).emit('new-detection', detection);
    }

    logger.info(`New detection created: ${detection.id}`, { userId, detectionId: detection.id });

    res.status(201).json({
      success: true,
      message: 'Detection created successfully',
      data: detection,
    });
  });

  /**
   * Review a detection
   */
  reviewDetection = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reviewNotes, isFalsePositive } = req.body;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      throw new AppError('User not authenticated', 401);
    }

    const detection = await this.detectionService.reviewDetection(
      id,
      reviewerId,
      reviewNotes,
      isFalsePositive
    );

    logger.info(`Detection reviewed: ${id}`, { reviewerId, isFalsePositive });

    res.status(200).json({
      success: true,
      message: 'Detection reviewed successfully',
      data: detection,
    });
  });

  /**
   * Delete detection
   */
  deleteDetection = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    await this.detectionService.deleteDetection(id);

    logger.info(`Detection deleted: ${id}`, { userId });

    res.status(200).json({
      success: true,
      message: 'Detection deleted successfully',
    });
  });

  /**
   * Get detection statistics
   */
  getDetectionStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { plantId, startDate, endDate } = req.query;

    const stats = await this.detectionService.getDetectionStats({
      plantId: plantId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.status(200).json({
      success: true,
      message: 'Detection statistics retrieved successfully',
      data: stats,
    });
  });

  /**
   * Get detections by plant
   */
  getDetectionsByPlant = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { plantId } = req.params;
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
    } = req.query;

    const filters = {
      plantId,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string,
    };

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await this.detectionService.getDetections(filters, pagination);

    res.status(200).json({
      success: true,
      message: 'Detections retrieved successfully',
      data: result.detections,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
      },
    });
  });
}
