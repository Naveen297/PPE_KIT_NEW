import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  appName: process.env.APP_NAME || 'PPE Detection System',
  appUrl: process.env.APP_URL || 'http://localhost:5000',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'ppe_detection_system',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // File Upload
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/jpg'],
  },

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'ap-south-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@mahindra-ppe.com',
  },

  // SMS
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  // AI Model
  aiModel: {
    apiUrl: process.env.AI_MODEL_API_URL || 'http://localhost:8000',
    apiKey: process.env.AI_MODEL_API_KEY || '',
    confidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.85'),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },

  // Socket.IO
  socket: {
    enabled: process.env.SOCKET_ENABLED !== 'false',
    corsOrigin: process.env.SOCKET_CORS_ORIGIN || '*',
  },

  // Monitoring
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
  },

  // Camera
  camera: {
    rtspTimeout: parseInt(process.env.RTSP_TIMEOUT || '30000', 10),
    healthCheckInterval: parseInt(process.env.CAMERA_HEALTH_CHECK_INTERVAL || '60000', 10),
  },

  // Reports
  reports: {
    retentionDays: parseInt(process.env.REPORT_RETENTION_DAYS || '90', 10),
    generationQueueConcurrency: parseInt(process.env.REPORT_GENERATION_QUEUE_CONCURRENCY || '2', 10),
  },

  // Alerts
  alerts: {
    retryAttempts: parseInt(process.env.ALERT_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.ALERT_RETRY_DELAY || '5000', 10),
  },

  // Feature Flags
  features: {
    realTimeDetection: process.env.ENABLE_REAL_TIME_DETECTION !== 'false',
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
    smsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
    pushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS !== 'false',
  },
};
