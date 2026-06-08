import Joi from 'joi';

export const detectionSchemas = {
  getDetections: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('compliant', 'violation', 'warning'),
    plantId: Joi.string().uuid(),
    zoneId: Joi.string().uuid(),
    cameraId: Joi.string().uuid(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    sortBy: Joi.string().valid('timestamp', 'confidence_score', 'status').default('timestamp'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
  }),

  createDetection: Joi.object({
    detectionCode: Joi.string().required(),
    cameraId: Joi.string().uuid().required(),
    zoneId: Joi.string().uuid().required(),
    plantId: Joi.string().uuid().required(),
    timestamp: Joi.date().iso(),
    status: Joi.string().valid('compliant', 'violation', 'warning').required(),
    confidenceScore: Joi.number().min(0).max(100).required(),
    personCount: Joi.number().integer().min(1).default(1),
    imageUrl: Joi.string().uri(),
    imagePath: Joi.string(),
    thumbnailUrl: Joi.string().uri(),
    videoClipUrl: Joi.string().uri(),
    metadata: Joi.object(),
    bbsScore: Joi.number().min(0).max(100),
    items: Joi.array().items(
      Joi.object({
        ppeItemId: Joi.string().uuid().required(),
        isDetected: Joi.boolean().required(),
        confidence: Joi.number().min(0).max(100).required(),
        boundingBox: Joi.object({
          x: Joi.number().required(),
          y: Joi.number().required(),
          width: Joi.number().required(),
          height: Joi.number().required(),
        }),
      })
    ),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical'),
    zoneName: Joi.string(),
  }),

  reviewDetection: Joi.object({
    reviewNotes: Joi.string().required(),
    isFalsePositive: Joi.boolean().default(false),
  }),
};
