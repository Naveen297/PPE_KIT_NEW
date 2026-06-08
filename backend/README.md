# PPE Detection System - Backend API

A comprehensive Node.js/TypeScript backend for the PPE Detection System, providing RESTful APIs for managing PPE compliance monitoring in Mahindra manufacturing plants.

## Features

- 🔐 **JWT Authentication & Authorization** - Role-based access control
- 📊 **Real-time Detection Tracking** - WebSocket support for live updates
- 🎯 **Incident Management** - Automated incident creation and tracking
- 📈 **Analytics & Reporting** - Pre-calculated statistics and custom reports
- 🔔 **Multi-channel Alerts** - Email, SMS, and push notifications
- 📝 **Audit Logging** - Complete audit trail for compliance
- 🚀 **High Performance** - Connection pooling, caching, and pagination
- 🛡️ **Security** - Helmet, rate limiting, and input validation
- 📚 **Well-documented** - Clear code structure and API documentation

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Cache**: Redis (optional)
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **File Upload**: Multer
- **Queue**: Bull (for background jobs)

## Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── index.ts         # Centralized config
│   ├── controllers/         # Request handlers
│   │   └── detection.controller.ts
│   ├── services/            # Business logic
│   │   └── detection.service.ts
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   │   ├── index.ts         # Main router
│   │   └── detection.routes.ts
│   ├── middlewares/         # Custom middleware
│   │   ├── auth.ts          # Authentication
│   │   ├── errorHandler.ts # Error handling
│   │   ├── validation.ts    # Request validation
│   │   └── rateLimiter.ts   # Rate limiting
│   ├── validators/          # Joi validation schemas
│   │   └── detection.validator.ts
│   ├── utils/               # Utility functions
│   │   └── logger.ts        # Winston logger
│   ├── database/            # Database related
│   │   ├── connection.ts    # PostgreSQL connection
│   │   └── seeds/           # Seed data
│   ├── types/               # TypeScript type definitions
│   └── server.ts            # Application entry point
├── dist/                    # Compiled JavaScript (generated)
├── logs/                    # Application logs
├── uploads/                 # Uploaded files
├── .env.example             # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Redis (optional, for caching and queues)

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb ppe_detection_system

   # Run migrations
   psql -d ppe_detection_system -f ../database/ppe_detection_schema.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run migrate      # Run database migrations
npm run seed         # Seed database with initial data
```

## API Documentation

### Base URL

```
Development: http://localhost:5000/api/v1
Production: https://api.your-domain.com/api/v1
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Main API Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user profile

#### Detections
- `GET /detections` - Get all detections (with filters)
- `GET /detections/:id` - Get detection by ID
- `POST /detections` - Create new detection
- `PUT /detections/:id/review` - Review detection
- `DELETE /detections/:id` - Delete detection
- `GET /detections/stats/summary` - Get detection statistics
- `GET /detections/plant/:plantId` - Get detections by plant

#### Plants
- `GET /plants` - Get all plants
- `GET /plants/:id` - Get plant by ID
- `POST /plants` - Create new plant
- `PUT /plants/:id` - Update plant
- `DELETE /plants/:id` - Delete plant
- `GET /plants/:id/zones` - Get zones for plant
- `GET /plants/:id/cameras` - Get cameras for plant

#### Incidents
- `GET /incidents` - Get all incidents
- `GET /incidents/:id` - Get incident by ID
- `POST /incidents` - Create incident
- `PUT /incidents/:id` - Update incident
- `PUT /incidents/:id/assign` - Assign incident
- `PUT /incidents/:id/resolve` - Resolve incident

#### Alerts
- `GET /alerts` - Get all alerts
- `GET /alerts/:id` - Get alert by ID
- `PUT /alerts/:id/acknowledge` - Acknowledge alert
- `PUT /alerts/:id/dismiss` - Dismiss alert

#### Reports
- `GET /reports` - Get all reports
- `POST /reports/generate` - Generate new report
- `GET /reports/:id/download` - Download report

#### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/charts/compliance` - Compliance chart data
- `GET /dashboard/charts/incidents` - Incidents chart data

### Example Requests

#### Create Detection

```bash
POST /api/v1/detections
Content-Type: application/json
Authorization: Bearer <token>

{
  "detectionCode": "DET-2025-001",
  "cameraId": "uuid-here",
  "zoneId": "uuid-here",
  "plantId": "uuid-here",
  "status": "violation",
  "confidenceScore": 92.5,
  "personCount": 1,
  "imageUrl": "https://example.com/image.jpg",
  "bbsScore": 65.0,
  "items": [
    {
      "ppeItemId": "uuid-helmet",
      "isDetected": false,
      "confidence": 95.2,
      "boundingBox": {
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 250
      }
    }
  ]
}
```

#### Get Detections with Filters

```bash
GET /api/v1/detections?status=violation&plantId=uuid&page=1&limit=20
Authorization: Bearer <token>
```

## WebSocket Events

Connect to `ws://localhost:5000` for real-time updates.

### Client → Server Events
- `join-plant` - Join a plant room for updates
- `leave-plant` - Leave a plant room

### Server → Client Events
- `new-detection` - New detection created
- `new-incident` - New incident created
- `new-alert` - New alert created
- `camera-status-change` - Camera status updated

### Example Socket.IO Client

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join plant room
socket.emit('join-plant', 'plant-uuid');

// Listen for new detections
socket.on('new-detection', (detection) => {
  console.log('New detection:', detection);
});
```

## Environment Variables

See `.env.example` for all available environment variables.

### Required Variables

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ppe_detection_system
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

## Security

### Implemented Security Measures

1. **Helmet** - Sets security-related HTTP headers
2. **CORS** - Configurable CORS policy
3. **Rate Limiting** - Prevents abuse
4. **Input Validation** - Joi schema validation
5. **SQL Injection Protection** - Parameterized queries
6. **JWT Authentication** - Secure token-based auth
7. **Password Hashing** - bcrypt for passwords
8. **Error Handling** - Never expose sensitive data

### Best Practices

- Never commit `.env` file
- Rotate JWT secrets regularly
- Use HTTPS in production
- Enable SSL for database connections
- Implement API versioning
- Monitor and log all activities

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Logging

Logs are stored in the `logs/` directory:

- `combined.log` - All logs
- `error.log` - Error logs only

### Log Levels

- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `debug` - Debug messages (development only)

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
NODE_ENV=production npm start
```

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/server.js --name ppe-backend

# Monitor
pm2 monit

# View logs
pm2 logs ppe-backend

# Restart
pm2 restart ppe-backend
```

### Docker Deployment

```bash
# Build image
docker build -t ppe-backend .

# Run container
docker run -p 5000:5000 --env-file .env ppe-backend
```

## Performance Optimization

1. **Database Connection Pooling** - Reuse connections
2. **Query Optimization** - Indexes and efficient queries
3. **Caching** - Redis for frequently accessed data
4. **Compression** - gzip compression for responses
5. **Pagination** - Limit data transfer
6. **Background Jobs** - Bull queue for heavy tasks

## Monitoring

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2025-12-02T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Metrics

Enable metrics in `.env`:
```env
ENABLE_METRICS=true
METRICS_PORT=9090
```

Access metrics at `http://localhost:9090/metrics`

## Troubleshooting

### Common Issues

1. **Database connection fails**
   - Check PostgreSQL is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **Port already in use**
   - Change PORT in `.env`
   - Kill process using the port

3. **Module not found errors**
   - Run `npm install`
   - Delete `node_modules` and reinstall

4. **TypeScript compilation errors**
   - Check `tsconfig.json`
   - Update TypeScript: `npm install -D typescript@latest`

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run linting: `npm run lint:fix`
5. Commit with clear message
6. Create pull request

## License

ISC

## Contact

For questions or support:
- Email: support@mahindra-ppe.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

---

**Built with ❤️ by Mahindra AI Team**
