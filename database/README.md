# PPE Detection System - Database Documentation

## Overview

This database schema is designed for a comprehensive PPE (Personal Protective Equipment) detection system used in Mahindra manufacturing plants. The system monitors worker safety compliance using AI-powered cameras and provides real-time alerts, analytics, and reporting capabilities.

## Database Technology

- **Database**: PostgreSQL 14+
- **Extensions Required**:
  - `uuid-ossp` (for UUID generation)
  - `pgcrypto` (for encryption)

## Schema Files

1. **schema.dbml** - DBML format for ERD visualization (use with dbdiagram.io or VS Code extensions)
2. **ppe_detection_schema.sql** - Complete PostgreSQL schema with triggers, indexes, and seed data
3. **ppe_detection.erd** - Plain text ERD documentation

## Database Architecture

The database is organized into 7 main modules:

### 1. User Management Module
- **users** - System users with role-based access
- **roles** - User roles (admin, supervisor, operator, viewer, auditor)
- **notification_preferences** - Per-user notification settings

### 2. Plant Infrastructure Module
- **plants** - Manufacturing facilities
- **zones** - Areas within plants (Assembly Line, Welding Section, etc.)
- **cameras** - Surveillance cameras with AI detection capabilities

### 3. PPE Items Module
- **ppe_items** - Catalog of PPE equipment (Helmet, Gloves, Vest, Boots, Goggles, Mask)

### 4. Detection System Module
- **detections** - Main detection events with compliance status
- **detection_items** - Junction table for PPE items in each detection

### 5. Incident Management Module
- **incidents** - Safety violations and incidents
- **alerts** - System alerts and notifications

### 6. Analytics & Reporting Module
- **reports** - Generated reports (daily, weekly, monthly)
- **audit_logs** - Complete audit trail
- **dashboard_stats** - Pre-calculated statistics

### 7. Configuration Module
- **system_settings** - System-wide configuration
- **notification_preferences** - User notification settings

## Key Relationships

```
plants (1) ──→ (N) zones ──→ (N) cameras
                 ↓
              detections ←──→ detection_items ←──→ ppe_items
                 ↓
              incidents ──→ alerts
                 ↓
              reports

users ──→ roles
users ──→ plants (optional assignment)
users ──→ notification_preferences (1:1)
```

## Core Features

### 1. Real-time Detection Tracking
- Camera-based PPE detection with confidence scores
- Support for multiple PPE items per detection
- Automatic compliance status calculation
- BBS (Behavior-Based Safety) scoring

### 2. Incident Management
- Automatic incident creation from violations
- Assignment and tracking workflow
- Root cause and corrective action documentation
- Priority and severity classification

### 3. Alert System
- Real-time alerts for violations
- Camera offline monitoring
- Multi-channel notifications (email, SMS, push, in-app)
- Configurable alert thresholds

### 4. Analytics & Reporting
- Pre-calculated dashboard statistics
- Hourly and daily aggregations
- Custom report generation
- Compliance rate tracking
- Zone-wise and plant-wise analytics

### 5. Audit Trail
- Complete audit logging
- User action tracking
- Data change history
- Compliance and security monitoring

## Setup Instructions

### 1. Create Database

```bash
createdb ppe_detection_system
```

### 2. Run Schema Script

```bash
psql -d ppe_detection_system -f ppe_detection_schema.sql
```

### 3. Verify Setup

```sql
-- Check tables
\dt

-- Check views
\dv

-- Check triggers
\dy

-- Verify seed data
SELECT * FROM roles;
SELECT * FROM ppe_items;
SELECT * FROM system_settings;
```

## Initial Data

The schema includes seed data for:

1. **Roles**:
   - admin (full system access)
   - supervisor (manage incidents, generate reports)
   - operator (view and acknowledge alerts)
   - viewer (read-only access)
   - auditor (view audit logs, generate reports)

2. **PPE Items**:
   - Safety Helmet (critical, 30% weight)
   - Safety Gloves (high, 20% weight)
   - Safety Vest (high, 25% weight)
   - Safety Boots (critical, 25% weight)
   - Safety Goggles (medium, 10% weight)
   - Face Mask (medium, 10% weight)

3. **System Settings**:
   - Detection confidence threshold: 0.85
   - Refresh interval: 15000ms
   - Email notifications: enabled
   - Report retention: 90 days
   - Max detections display: 100

## Database Views

### v_recent_detections
Complete detection information with plant, zone, camera, and PPE details.

```sql
SELECT * FROM v_recent_detections
WHERE plant_code = 'MPP'
ORDER BY timestamp DESC
LIMIT 10;
```

### v_plant_statistics
Aggregated statistics per plant including compliance rates and incident counts.

```sql
SELECT * FROM v_plant_statistics
WHERE plant_code = 'MPP';
```

## Performance Optimization

### Indexes
- All foreign keys are indexed
- Composite indexes for common query patterns
- Timestamp indexes for time-series queries
- Status and type fields indexed for filtering

### Pre-calculated Statistics
- `dashboard_stats` table stores hourly and daily aggregations
- Reduces real-time calculation overhead
- Update via scheduled jobs or triggers

## Security Considerations

### 1. Data Encryption
- Passwords stored as hashes (use bcrypt)
- Sensitive settings marked with `is_encrypted` flag
- Use application-layer encryption for encrypted fields

### 2. Audit Logging
- All CUD operations logged
- User and IP tracking
- Data change history

### 3. Role-Based Access Control
- Granular permissions via JSON structure
- Role-based query filtering
- Plant-level data isolation

## Maintenance Tasks

### Daily
- Backup database
- Archive old detections (>90 days)
- Update dashboard statistics

### Weekly
- Vacuum and analyze tables
- Review slow queries
- Check index usage

### Monthly
- Archive old reports
- Purge soft-deleted records
- Review audit logs

## Monitoring Queries

### System Health

```sql
-- Check camera status
SELECT
    p.name as plant,
    z.name as zone,
    c.name as camera,
    c.status,
    c.last_heartbeat
FROM cameras c
JOIN zones z ON c.zone_id = z.id
JOIN plants p ON z.plant_id = p.id
WHERE c.is_active = true
ORDER BY c.last_heartbeat;
```

### Compliance Overview

```sql
-- Today's compliance by plant
SELECT
    p.name as plant,
    COUNT(*) as total_detections,
    SUM(CASE WHEN d.status = 'compliant' THEN 1 ELSE 0 END) as compliant,
    ROUND(AVG(d.confidence_score), 2) as avg_confidence,
    ROUND(100.0 * SUM(CASE WHEN d.status = 'compliant' THEN 1 ELSE 0 END) / COUNT(*), 2) as compliance_rate
FROM detections d
JOIN plants p ON d.plant_id = p.id
WHERE d.timestamp >= CURRENT_DATE
GROUP BY p.id, p.name;
```

### Active Incidents

```sql
-- Open incidents by severity
SELECT
    severity,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (NOW() - occurred_at))/3600) as avg_age_hours
FROM incidents
WHERE status IN ('open', 'in_progress')
GROUP BY severity
ORDER BY
    CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;
```

## Extension Points

### 1. Add New PPE Items
```sql
INSERT INTO ppe_items (name, code, category, priority, is_mandatory, compliance_weight)
VALUES ('Ear Plugs', 'EAR_PLUGS', 'hearing', 'medium', false, 0.05);
```

### 2. Add New Plant
```sql
INSERT INTO plants (name, code, location, city, state)
VALUES ('Pune Assembly Plant', 'PAP', 'Pune, Maharashtra', 'Pune', 'Maharashtra');
```

### 3. Configure Zone Requirements
```sql
UPDATE zones
SET required_ppe = '["HELMET", "GLOVES", "VEST", "BOOTS", "GOGGLES"]'::jsonb
WHERE code = 'WELDING_A';
```

## Troubleshooting

### Slow Queries
```sql
-- Check long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 seconds';
```

### Missing Indexes
```sql
-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
ORDER BY abs(correlation) ASC;
```

## Database Diagram

To visualize the database schema:

1. **Using VS Code**:
   - Install "ERD Editor" or "Database Client" extension
   - Open `schema.dbml` file
   - The extension will automatically render the ER diagram

2. **Using dbdiagram.io**:
   - Go to https://dbdiagram.io
   - Import the `schema.dbml` file
   - View and export the diagram

3. **Using DBeaver/pgAdmin**:
   - Connect to the database
   - Use built-in ER diagram tools
   - Generate visual representation

## Contact & Support

For questions or issues:
- Review this documentation
- Check the inline SQL comments
- Consult the application API documentation
- Contact the development team

---

**Last Updated**: December 2025
**Schema Version**: 1.0.0
**Database**: PostgreSQL 14+
