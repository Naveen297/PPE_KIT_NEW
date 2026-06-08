-- ===================================================================
-- PPE Detection System - Database Schema
-- Mahindra Manufacturing Plant Safety System
-- Database: PostgreSQL 14+
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- USER MANAGEMENT MODULE
-- ===================================================================

-- Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_role_name CHECK (name IN ('admin', 'supervisor', 'operator', 'viewer', 'auditor'))
);

CREATE INDEX idx_roles_name ON roles(name);

COMMENT ON TABLE roles IS 'User roles with granular permissions';
COMMENT ON COLUMN roles.permissions IS 'JSON object containing permission flags';

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    plant_id UUID REFERENCES plants(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_plant_id ON users(plant_id);
CREATE INDEX idx_users_is_active ON users(is_active);

COMMENT ON TABLE users IS 'System users including operators, supervisors, and administrators';

-- ===================================================================
-- PLANT INFRASTRUCTURE MODULE
-- ===================================================================

-- Plants Table
CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    is_active BOOLEAN DEFAULT true NOT NULL,
    total_employees INTEGER,
    operational_hours JSONB DEFAULT '{}'::jsonb,
    contact_person VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_plants_code ON plants(code);
CREATE INDEX idx_plants_is_active ON plants(is_active);

COMMENT ON TABLE plants IS 'Manufacturing plants/facilities';
COMMENT ON COLUMN plants.operational_hours IS 'Operating hours configuration in JSON format';

-- Zones Table
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    zone_type VARCHAR(50),
    risk_level VARCHAR(20),
    required_ppe JSONB DEFAULT '[]'::jsonb,
    area_sqm DECIMAL(10,2),
    max_capacity INTEGER,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT uq_plant_zone_code UNIQUE (plant_id, code)
);

CREATE INDEX idx_zones_plant_id ON zones(plant_id);
CREATE INDEX idx_zones_zone_type ON zones(zone_type);
CREATE INDEX idx_zones_risk_level ON zones(risk_level);
CREATE INDEX idx_zones_is_active ON zones(is_active);

COMMENT ON TABLE zones IS 'Zones/areas within manufacturing plants';
COMMENT ON COLUMN zones.required_ppe IS 'Array of required PPE item IDs for this zone';

-- Cameras Table
CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    camera_code VARCHAR(50) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    rtsp_url VARCHAR(512),
    http_url VARCHAR(512),
    location_description TEXT,
    position_x DECIMAL(10,2),
    position_y DECIMAL(10,2),
    camera_type VARCHAR(50),
    resolution VARCHAR(20),
    fps INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'active',
    last_heartbeat TIMESTAMP,
    uptime_percentage DECIMAL(5,2),
    ai_model_version VARCHAR(20),
    confidence_threshold DECIMAL(3,2) DEFAULT 0.85,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_camera_status CHECK (status IN ('active', 'inactive', 'maintenance', 'error')),
    CONSTRAINT check_confidence_threshold CHECK (confidence_threshold >= 0 AND confidence_threshold <= 1)
);

CREATE INDEX idx_cameras_camera_code ON cameras(camera_code);
CREATE INDEX idx_cameras_zone_id ON cameras(zone_id);
CREATE INDEX idx_cameras_status ON cameras(status);
CREATE INDEX idx_cameras_is_active ON cameras(is_active);

COMMENT ON TABLE cameras IS 'Surveillance cameras for PPE detection';
COMMENT ON COLUMN cameras.confidence_threshold IS 'Detection confidence threshold (0-1)';

-- ===================================================================
-- PPE ITEMS MODULE
-- ===================================================================

-- PPE Items Table
CREATE TABLE ppe_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    priority VARCHAR(20) NOT NULL,
    color_code VARCHAR(7),
    icon VARCHAR(50),
    is_mandatory BOOLEAN DEFAULT true NOT NULL,
    compliance_weight DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_priority CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    CONSTRAINT check_category CHECK (category IN ('head', 'hand', 'body', 'foot', 'face', 'respiratory')),
    CONSTRAINT check_compliance_weight CHECK (compliance_weight >= 0 AND compliance_weight <= 1)
);

CREATE INDEX idx_ppe_items_code ON ppe_items(code);
CREATE INDEX idx_ppe_items_category ON ppe_items(category);
CREATE INDEX idx_ppe_items_priority ON ppe_items(priority);

COMMENT ON TABLE ppe_items IS 'Personal Protective Equipment items catalog';
COMMENT ON COLUMN ppe_items.compliance_weight IS 'Weight in compliance calculation (0-1)';

-- ===================================================================
-- DETECTION SYSTEM MODULE
-- ===================================================================

-- Detections Table
CREATE TABLE detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detection_code VARCHAR(100) UNIQUE NOT NULL,
    camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE RESTRICT,
    zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE RESTRICT,
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE RESTRICT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    person_count INTEGER DEFAULT 1,
    image_url VARCHAR(512),
    image_path VARCHAR(512),
    thumbnail_url VARCHAR(512),
    video_clip_url VARCHAR(512),
    metadata JSONB DEFAULT '{}'::jsonb,
    bbs_score DECIMAL(5,2),
    processed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    is_false_positive BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_detection_status CHECK (status IN ('compliant', 'violation', 'warning')),
    CONSTRAINT check_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 100),
    CONSTRAINT check_bbs_score CHECK (bbs_score IS NULL OR (bbs_score >= 0 AND bbs_score <= 100))
);

CREATE INDEX idx_detections_detection_code ON detections(detection_code);
CREATE INDEX idx_detections_camera_id ON detections(camera_id);
CREATE INDEX idx_detections_zone_id ON detections(zone_id);
CREATE INDEX idx_detections_plant_id ON detections(plant_id);
CREATE INDEX idx_detections_timestamp ON detections(timestamp);
CREATE INDEX idx_detections_status ON detections(status);
CREATE INDEX idx_detections_plant_timestamp ON detections(plant_id, timestamp);
CREATE INDEX idx_detections_zone_timestamp ON detections(zone_id, timestamp);

COMMENT ON TABLE detections IS 'Main PPE detection events';
COMMENT ON COLUMN detections.bbs_score IS 'Behavior-Based Safety score';

-- Detection Items Table (Junction table)
CREATE TABLE detection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detection_id UUID NOT NULL REFERENCES detections(id) ON DELETE CASCADE,
    ppe_item_id UUID NOT NULL REFERENCES ppe_items(id) ON DELETE RESTRICT,
    is_detected BOOLEAN NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    bounding_box JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_item_confidence CHECK (confidence >= 0 AND confidence <= 100),
    CONSTRAINT uq_detection_ppe_item UNIQUE (detection_id, ppe_item_id)
);

CREATE INDEX idx_detection_items_detection_id ON detection_items(detection_id);
CREATE INDEX idx_detection_items_ppe_item_id ON detection_items(ppe_item_id);
CREATE INDEX idx_detection_items_is_detected ON detection_items(is_detected);

COMMENT ON TABLE detection_items IS 'Individual PPE items detected or missing in each detection';
COMMENT ON COLUMN detection_items.bounding_box IS 'Bounding box coordinates {x, y, width, height}';

-- ===================================================================
-- INCIDENT MANAGEMENT MODULE
-- ===================================================================

-- Incidents Table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_code VARCHAR(100) UNIQUE NOT NULL,
    detection_id UUID NOT NULL REFERENCES detections(id) ON DELETE RESTRICT,
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE RESTRICT,
    zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE RESTRICT,
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    root_cause TEXT,
    corrective_action TEXT,
    status VARCHAR(20) DEFAULT 'open',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    priority INTEGER DEFAULT 0,
    due_date TIMESTAMP,
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_incident_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT check_incident_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'))
);

CREATE INDEX idx_incidents_incident_code ON incidents(incident_code);
CREATE INDEX idx_incidents_detection_id ON incidents(detection_id);
CREATE INDEX idx_incidents_plant_id ON incidents(plant_id);
CREATE INDEX idx_incidents_zone_id ON incidents(zone_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX idx_incidents_plant_occurred ON incidents(plant_id, occurred_at);

COMMENT ON TABLE incidents IS 'Safety incidents and violations requiring action';

-- Alerts Table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_code VARCHAR(100) UNIQUE NOT NULL,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    detection_id UUID REFERENCES detections(id) ON DELETE SET NULL,
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE RESTRICT,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    recipients JSONB DEFAULT '[]'::jsonb,
    notification_sent BOOLEAN DEFAULT false,
    notification_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_alert_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT check_alert_status CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed'))
);

CREATE INDEX idx_alerts_alert_code ON alerts(alert_code);
CREATE INDEX idx_alerts_incident_id ON alerts(incident_id);
CREATE INDEX idx_alerts_detection_id ON alerts(detection_id);
CREATE INDEX idx_alerts_plant_id ON alerts(plant_id);
CREATE INDEX idx_alerts_zone_id ON alerts(zone_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

COMMENT ON TABLE alerts IS 'System alerts and notifications';
COMMENT ON COLUMN alerts.recipients IS 'Array of user IDs to notify';

-- ===================================================================
-- ANALYTICS & REPORTING MODULE
-- ===================================================================

-- Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_code VARCHAR(100) UNIQUE NOT NULL,
    plant_id UUID REFERENCES plants(id) ON DELETE SET NULL,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    generated_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'pending',
    file_path VARCHAR(512),
    file_url VARCHAR(512),
    file_format VARCHAR(10),
    file_size_kb INTEGER,
    metrics JSONB DEFAULT '{}'::jsonb,
    filters JSONB DEFAULT '{}'::jsonb,
    generated_at TIMESTAMP,
    downloaded_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_report_status CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    CONSTRAINT check_report_type CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom', 'incident'))
);

CREATE INDEX idx_reports_report_code ON reports(report_code);
CREATE INDEX idx_reports_plant_id ON reports(plant_id);
CREATE INDEX idx_reports_report_type ON reports(report_type);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_plant_period ON reports(plant_id, period_start, period_end);

COMMENT ON TABLE reports IS 'Generated analytical reports';
COMMENT ON COLUMN reports.metrics IS 'Summary metrics included in report';
COMMENT ON COLUMN reports.filters IS 'Filters applied when generating report';

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    plant_id UUID REFERENCES plants(id) ON DELETE SET NULL,
    status VARCHAR(20),
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_plant_id ON audit_logs(plant_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);

COMMENT ON TABLE audit_logs IS 'System audit trail for compliance and security';

-- ===================================================================
-- CONFIGURATION MODULE
-- ===================================================================

-- System Settings Table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    data_type VARCHAR(20) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_data_type CHECK (data_type IN ('string', 'number', 'boolean', 'json'))
);

CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);

COMMENT ON TABLE system_settings IS 'System-wide configuration settings';
COMMENT ON COLUMN system_settings.is_system IS 'System settings cannot be deleted';

-- Notification Preferences Table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    alert_severity_threshold VARCHAR(20) DEFAULT 'medium',
    alert_types JSONB DEFAULT '[]'::jsonb,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_alert_severity_threshold CHECK (alert_severity_threshold IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

COMMENT ON TABLE notification_preferences IS 'User notification preferences';
COMMENT ON COLUMN notification_preferences.alert_types IS 'Array of alert types to receive';

-- ===================================================================
-- DASHBOARD & ANALYTICS VIEWS
-- ===================================================================

-- Dashboard Stats Table (Pre-calculated)
CREATE TABLE dashboard_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hour INTEGER,
    total_detections INTEGER DEFAULT 0,
    compliant_count INTEGER DEFAULT 0,
    violation_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    compliance_rate DECIMAL(5,2),
    bbs_score_avg DECIMAL(5,2),
    incidents_count INTEGER DEFAULT 0,
    critical_incidents_count INTEGER DEFAULT 0,
    cameras_active INTEGER DEFAULT 0,
    cameras_total INTEGER DEFAULT 0,
    uptime_percentage DECIMAL(5,2),
    unique_zones_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT check_hour CHECK (hour IS NULL OR (hour >= 0 AND hour <= 23)),
    CONSTRAINT uq_plant_date_hour UNIQUE (plant_id, date, hour)
);

CREATE INDEX idx_dashboard_stats_plant_id ON dashboard_stats(plant_id);
CREATE INDEX idx_dashboard_stats_date ON dashboard_stats(date);
CREATE INDEX idx_dashboard_stats_plant_date ON dashboard_stats(plant_id, date);

COMMENT ON TABLE dashboard_stats IS 'Pre-calculated dashboard statistics for performance';
COMMENT ON COLUMN dashboard_stats.hour IS 'Hour of day (0-23) for hourly stats, NULL for daily stats';

-- ===================================================================
-- FUNCTIONS & TRIGGERS
-- ===================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ppe_items_updated_at BEFORE UPDATE ON ppe_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_detections_updated_at BEFORE UPDATE ON detections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_stats_updated_at BEFORE UPDATE ON dashboard_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, old_values, status
        ) VALUES (
            current_setting('app.current_user_id', true)::uuid,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD),
            'success'
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, old_values, new_values, status
        ) VALUES (
            current_setting('app.current_user_id', true)::uuid,
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW),
            'success'
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, new_values, status
        ) VALUES (
            current_setting('app.current_user_id', true)::uuid,
            'INSERT',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW),
            'success'
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- ===================================================================
-- INITIAL DATA SEEDING
-- ===================================================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
    ('admin', 'System Administrator', '{"all": true}'::jsonb),
    ('supervisor', 'Plant Supervisor', '{"view": true, "manage_incidents": true, "generate_reports": true}'::jsonb),
    ('operator', 'System Operator', '{"view": true, "acknowledge_alerts": true}'::jsonb),
    ('viewer', 'Read-only Viewer', '{"view": true}'::jsonb),
    ('auditor', 'Compliance Auditor', '{"view": true, "view_audit_logs": true, "generate_reports": true}'::jsonb);

-- Insert PPE items
INSERT INTO ppe_items (name, code, category, priority, color_code, icon, is_mandatory, compliance_weight) VALUES
    ('Safety Helmet', 'HELMET', 'head', 'critical', '#3B82F6', '🪖', true, 0.30),
    ('Safety Gloves', 'GLOVES', 'hand', 'high', '#10B981', '🧤', true, 0.20),
    ('Safety Vest', 'VEST', 'body', 'high', '#F59E0B', '🦺', true, 0.25),
    ('Safety Boots', 'BOOTS', 'foot', 'critical', '#8B5CF6', '👢', true, 0.25),
    ('Safety Goggles', 'GOGGLES', 'face', 'medium', '#6366F1', '🥽', false, 0.10),
    ('Face Mask', 'MASK', 'respiratory', 'medium', '#EC4899', '😷', false, 0.10);

-- Insert system settings
INSERT INTO system_settings (key, value, data_type, category, description, is_system) VALUES
    ('detection.confidence_threshold', '0.85', 'number', 'detection', 'Minimum confidence threshold for detections', true),
    ('detection.refresh_interval', '15000', 'number', 'detection', 'Detection refresh interval in milliseconds', true),
    ('alerts.email_enabled', 'true', 'boolean', 'alerts', 'Enable email notifications', false),
    ('reports.retention_days', '90', 'number', 'reports', 'Number of days to retain generated reports', false),
    ('system.max_detections', '100', 'number', 'system', 'Maximum number of detections to display', false);

-- ===================================================================
-- VIEWS FOR COMMON QUERIES
-- ===================================================================

-- View: Recent Detections with Full Details
CREATE OR REPLACE VIEW v_recent_detections AS
SELECT
    d.id,
    d.detection_code,
    d.timestamp,
    d.status,
    d.confidence_score,
    d.bbs_score,
    p.name as plant_name,
    p.code as plant_code,
    z.name as zone_name,
    c.name as camera_name,
    c.camera_code,
    d.image_url,
    d.person_count,
    COALESCE(
        json_agg(
            json_build_object(
                'item', pi.name,
                'detected', di.is_detected,
                'confidence', di.confidence
            )
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'
    ) as ppe_details
FROM detections d
JOIN plants p ON d.plant_id = p.id
JOIN zones z ON d.zone_id = z.id
JOIN cameras c ON d.camera_id = c.id
LEFT JOIN detection_items di ON d.id = di.detection_id
LEFT JOIN ppe_items pi ON di.ppe_item_id = pi.id
GROUP BY d.id, p.name, p.code, z.name, c.name, c.camera_code;

-- View: Plant Statistics Summary
CREATE OR REPLACE VIEW v_plant_statistics AS
SELECT
    p.id as plant_id,
    p.name as plant_name,
    p.code as plant_code,
    COUNT(DISTINCT z.id) as total_zones,
    COUNT(DISTINCT c.id) as total_cameras,
    COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_cameras,
    COUNT(d.id) as total_detections,
    COUNT(CASE WHEN d.status = 'compliant' THEN 1 END) as compliant_count,
    COUNT(CASE WHEN d.status = 'violation' THEN 1 END) as violation_count,
    ROUND(
        CASE WHEN COUNT(d.id) > 0
        THEN (COUNT(CASE WHEN d.status = 'compliant' THEN 1 END)::decimal / COUNT(d.id) * 100)
        ELSE 0 END,
        2
    ) as compliance_rate,
    COUNT(DISTINCT i.id) as total_incidents,
    COUNT(DISTINCT CASE WHEN i.status = 'open' THEN i.id END) as open_incidents
FROM plants p
LEFT JOIN zones z ON p.id = z.plant_id
LEFT JOIN cameras c ON z.id = c.zone_id
LEFT JOIN detections d ON p.id = d.plant_id
LEFT JOIN incidents i ON p.id = i.plant_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.code;

-- ===================================================================
-- PERFORMANCE INDEXES
-- ===================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_detections_plant_status_timestamp ON detections(plant_id, status, timestamp DESC);
CREATE INDEX idx_incidents_plant_status_severity ON incidents(plant_id, status, severity);
CREATE INDEX idx_alerts_plant_status_created ON alerts(plant_id, status, created_at DESC);

-- ===================================================================
-- END OF SCHEMA
-- ===================================================================
