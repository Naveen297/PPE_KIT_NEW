# PPE Detection System - Complete Setup Guide

## Overview

This guide will help you set up the complete PPE Detection System with database, backend API, and frontend integration.

## What's Included

### 1. Database Schema (PostgreSQL)
- **Location**: `database/`
- **Files**:
  - `schema.dbml` - DBML format for ERD visualization
  - `ppe_detection_schema.sql` - Complete PostgreSQL schema
  - `ppe_detection.erd` - Plain text documentation
  - `README.md` - Database documentation

### 2. Backend API (Node.js/TypeScript/Express)
- **Location**: `backend/`
- **Features**:
  - RESTful API with JWT authentication
  - Real-time WebSocket support
  - Role-based access control
  - Comprehensive error handling
  - Input validation with Joi
  - Logging with Winston
  - Rate limiting and security

### 3. Frontend (React/Vite)
- **Location**: `src/`
- **Current Status**: Existing React dashboard
- **Integration**: Ready to connect with backend APIs

## Architecture

```
┌─────────────────┐
│   React App     │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│  Express API    │
│   (Backend)     │
└────────┬────────┘
         │ SQL
         │
┌────────▼────────┐
│  PostgreSQL     │
│   (Database)    │
└─────────────────┘
```

## Complete Setup Steps

### Step 1: Database Setup

1. **Install PostgreSQL** (if not installed)
   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14

   # Ubuntu
   sudo apt-get install postgresql-14
   sudo systemctl start postgresql
   ```

2. **Create Database**
   ```bash
   createdb ppe_detection_system
   ```

3. **Run Schema**
   ```bash
   psql -d ppe_detection_system -f database/ppe_detection_schema.sql
   ```

4. **Verify Setup**
   ```bash
   psql -d ppe_detection_system -c "\dt"
   ```

### Step 2: View ER Diagram

**Option A: Using VS Code Extension**

1. Install "ERD Editor" extension in VS Code
2. Open `database/schema.dbml`
3. The extension will automatically render the diagram

**Option B: Using dbdiagram.io**

1. Go to https://dbdiagram.io
2. Click "Import" and select `database/schema.dbml`
3. View and export the diagram

### Step 3: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

   **Minimum required configuration**:
   ```env
   NODE_ENV=development
   PORT=5000

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ppe_detection_system
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT
   JWT_SECRET=your_secret_key_change_this_in_production
   JWT_EXPIRE=7d

   # CORS (add your frontend URL)
   CORS_ORIGIN=http://localhost:5173,http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ╔═══════════════════════════════════════════╗
   ║   PPE Detection System - Backend API     ║
   ║   Environment: development                ║
   ║   Port: 5000                              ║
   ╚═══════════════════════════════════════════╝
   ```

5. **Test the API**
   ```bash
   curl http://localhost:5000/health
   ```

### Step 4: Frontend Integration

1. **Navigate to project root**
   ```bash
   cd ..
   ```

2. **Install axios** (if not already installed)
   ```bash
   npm install axios
   ```

3. **Create API service** (`src/services/api.js`)
   ```javascript
   import axios from 'axios';

   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

   const api = axios.create({
     baseURL: API_BASE_URL,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   // Add token to requests
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

   export default api;
   ```

4. **Create environment file** (`.env`)
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_WS_URL=http://localhost:5000
   ```

5. **Update detection service** (`src/services/detectionService.js`)
   ```javascript
   import api from './api';

   export const getDetections = async (filters = {}) => {
     const response = await api.get('/detections', { params: filters });
     return response.data;
   };

   export const getDetectionById = async (id) => {
     const response = await api.get(`/detections/${id}`);
     return response.data;
   };

   export const createDetection = async (data) => {
     const response = await api.post('/detections', data);
     return response.data;
   };
   ```

6. **Add Socket.IO client** (for real-time updates)
   ```bash
   npm install socket.io-client
   ```

   Create `src/services/socket.js`:
   ```javascript
   import { io } from 'socket.io-client';

   const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

   export const socket = io(SOCKET_URL, {
     autoConnect: false,
   });

   export const connectSocket = () => {
     socket.connect();
   };

   export const disconnectSocket = () => {
     socket.disconnect();
   };

   export const joinPlant = (plantId) => {
     socket.emit('join-plant', plantId);
   };

   export const listenForDetections = (callback) => {
     socket.on('new-detection', callback);
   };
   ```

### Step 5: Run the Complete System

1. **Terminal 1 - Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2 - Frontend**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/v1
   - Health Check: http://localhost:5000/health

## Database Schema Overview

### Core Tables

1. **User Management**
   - `users` - System users
   - `roles` - User roles and permissions
   - `notification_preferences` - User notification settings

2. **Infrastructure**
   - `plants` - Manufacturing facilities
   - `zones` - Areas within plants
   - `cameras` - Surveillance cameras
   - `ppe_items` - PPE equipment catalog

3. **Detection & Compliance**
   - `detections` - Main detection events
   - `detection_items` - PPE items per detection
   - `incidents` - Safety violations
   - `alerts` - System alerts

4. **Analytics**
   - `reports` - Generated reports
   - `dashboard_stats` - Pre-calculated statistics
   - `audit_logs` - System audit trail

## API Endpoints Quick Reference

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Detections
- `GET /api/v1/detections` - List detections
- `GET /api/v1/detections/:id` - Get detection
- `POST /api/v1/detections` - Create detection
- `PUT /api/v1/detections/:id/review` - Review detection
- `GET /api/v1/detections/stats/summary` - Get stats

### Plants
- `GET /api/v1/plants` - List plants
- `GET /api/v1/plants/:id` - Get plant
- `GET /api/v1/plants/:id/zones` - Get zones
- `GET /api/v1/plants/:id/cameras` - Get cameras

### Dashboard
- `GET /api/v1/dashboard/stats` - Dashboard statistics

## Default Users & Roles

After running the schema, these roles are available:
- `admin` - Full system access
- `supervisor` - Manage incidents, generate reports
- `operator` - View and acknowledge alerts
- `viewer` - Read-only access
- `auditor` - View audit logs, generate reports

## Default PPE Items

Pre-configured PPE items:
- Safety Helmet (critical, 30% weight)
- Safety Gloves (high, 20% weight)
- Safety Vest (high, 25% weight)
- Safety Boots (critical, 25% weight)
- Safety Goggles (medium, 10% weight)
- Face Mask (medium, 10% weight)

## Testing the System

### 1. Test Database Connection

```bash
psql -d ppe_detection_system -c "SELECT COUNT(*) FROM users;"
```

### 2. Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# API endpoint (replace with actual token after login)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/v1/detections
```

### 3. Test Frontend

Open browser to http://localhost:5173 and verify:
- Dashboard loads
- Stats display correctly
- Tables show data
- Charts render

## Common Issues & Solutions

### Issue: Database connection fails
**Solution**: Check PostgreSQL is running and credentials in `.env` are correct

```bash
# Check PostgreSQL status
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux
```

### Issue: Port already in use
**Solution**: Change PORT in `.env` or kill the process

```bash
# Find process on port 5000
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)
```

### Issue: TypeScript errors in backend
**Solution**: Ensure all dependencies are installed

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue: CORS errors
**Solution**: Add frontend URL to `CORS_ORIGIN` in backend `.env`

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## Next Steps

### 1. Add Authentication
- Implement login/register pages in frontend
- Store JWT token in localStorage
- Add protected routes

### 2. Integrate Real-time Updates
- Connect Socket.IO in React components
- Listen for detection events
- Update UI in real-time

### 3. Add More Features
- User management UI
- Plant and camera configuration
- Incident tracking dashboard
- Report generation interface

### 4. Deploy to Production
- Set up production database
- Configure environment variables
- Deploy backend (PM2, Docker, or cloud service)
- Deploy frontend (Vercel, Netlify, or cloud service)
- Enable HTTPS
- Set up monitoring and logging

## File Structure Summary

```
PPE_KIT/
├── database/                    # Database files
│   ├── schema.dbml             # DBML ERD (use with VS Code/dbdiagram.io)
│   ├── ppe_detection_schema.sql # PostgreSQL schema
│   ├── ppe_detection.erd       # Plain text ERD
│   └── README.md               # Database documentation
│
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Custom middleware
│   │   ├── validators/        # Joi schemas
│   │   ├── utils/             # Utilities
│   │   ├── database/          # DB connection
│   │   └── server.ts          # Entry point
│   ├── .env.example           # Environment template
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── src/                        # Frontend (React)
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.jsx
│
├── package.json
└── SETUP_GUIDE.md             # This file
```

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Socket.IO Documentation](https://socket.io/docs/)

## Support

For issues or questions:
1. Check this setup guide
2. Review README files in each directory
3. Check error logs in `backend/logs/`
4. Contact the development team

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Built for**: Mahindra Manufacturing Plants
