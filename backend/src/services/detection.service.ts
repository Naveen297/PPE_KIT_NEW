import { db } from '../database/connection';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

interface DetectionFilters {
  status?: string;
  plantId?: string;
  zoneId?: string;
  cameraId?: string;
  startDate?: string;
  endDate?: string;
}

interface Pagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class DetectionService {
  /**
   * Get detections with filters and pagination
   */
  async getDetections(filters: DetectionFilters, pagination: Pagination) {
    try {
      let query = `
        SELECT
          d.*,
          p.name as plant_name,
          p.code as plant_code,
          z.name as zone_name,
          c.name as camera_name,
          c.camera_code,
          u.first_name || ' ' || u.last_name as reviewed_by_name
        FROM detections d
        JOIN plants p ON d.plant_id = p.id
        JOIN zones z ON d.zone_id = z.id
        JOIN cameras c ON d.camera_id = c.id
        LEFT JOIN users u ON d.reviewed_by = u.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramCount = 1;

      // Apply filters
      if (filters.status) {
        query += ` AND d.status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }

      if (filters.plantId) {
        query += ` AND d.plant_id = $${paramCount}`;
        params.push(filters.plantId);
        paramCount++;
      }

      if (filters.zoneId) {
        query += ` AND d.zone_id = $${paramCount}`;
        params.push(filters.zoneId);
        paramCount++;
      }

      if (filters.cameraId) {
        query += ` AND d.camera_id = $${paramCount}`;
        params.push(filters.cameraId);
        paramCount++;
      }

      if (filters.startDate) {
        query += ` AND d.timestamp >= $${paramCount}`;
        params.push(filters.startDate);
        paramCount++;
      }

      if (filters.endDate) {
        query += ` AND d.timestamp <= $${paramCount}`;
        params.push(filters.endDate);
        paramCount++;
      }

      // Get total count
      const countQuery = query.replace('SELECT d.*,', 'SELECT COUNT(*) as total FROM (SELECT d.*,');
      const countResult = await db.query(countQuery + ') as count_query', params);
      const total = parseInt(countResult.rows[0].total);

      // Add sorting
      const sortBy = pagination.sortBy || 'timestamp';
      const sortOrder = pagination.sortOrder || 'DESC';
      query += ` ORDER BY d.${sortBy} ${sortOrder}`;

      // Add pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(pagination.limit, offset);

      const result = await db.query(query, params);

      // Get PPE items for each detection
      const detectionsWithItems = await Promise.all(
        result.rows.map(async (detection) => {
          const itemsResult = await db.query(
            `SELECT
              di.*,
              pi.name as ppe_name,
              pi.code as ppe_code,
              pi.category,
              pi.priority
            FROM detection_items di
            JOIN ppe_items pi ON di.ppe_item_id = pi.id
            WHERE di.detection_id = $1`,
            [detection.id]
          );
          return {
            ...detection,
            items: itemsResult.rows,
          };
        })
      );

      return {
        detections: detectionsWithItems,
        total,
      };
    } catch (error) {
      logger.error('Error fetching detections:', error);
      throw error;
    }
  }

  /**
   * Get detection by ID
   */
  async getDetectionById(id: string) {
    try {
      const result = await db.query(
        `SELECT
          d.*,
          p.name as plant_name,
          p.code as plant_code,
          z.name as zone_name,
          c.name as camera_name,
          c.camera_code,
          u.first_name || ' ' || u.last_name as reviewed_by_name
        FROM detections d
        JOIN plants p ON d.plant_id = p.id
        JOIN zones z ON d.zone_id = z.id
        JOIN cameras c ON d.camera_id = c.id
        LEFT JOIN users u ON d.reviewed_by = u.id
        WHERE d.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const detection = result.rows[0];

      // Get PPE items
      const itemsResult = await db.query(
        `SELECT
          di.*,
          pi.name as ppe_name,
          pi.code as ppe_code,
          pi.category,
          pi.priority
        FROM detection_items di
        JOIN ppe_items pi ON di.ppe_item_id = pi.id
        WHERE di.detection_id = $1`,
        [id]
      );

      return {
        ...detection,
        items: itemsResult.rows,
      };
    } catch (error) {
      logger.error('Error fetching detection by ID:', error);
      throw error;
    }
  }

  /**
   * Create new detection
   */
  async createDetection(data: any, userId?: string) {
    return await db.transaction(async (client) => {
      // Insert detection
      const detectionResult = await client.query(
        `INSERT INTO detections (
          detection_code, camera_id, zone_id, plant_id, timestamp,
          status, confidence_score, person_count, image_url, image_path,
          thumbnail_url, video_clip_url, metadata, bbs_score, processed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          data.detectionCode,
          data.cameraId,
          data.zoneId,
          data.plantId,
          data.timestamp || new Date(),
          data.status,
          data.confidenceScore,
          data.personCount || 1,
          data.imageUrl,
          data.imagePath,
          data.thumbnailUrl,
          data.videoClipUrl,
          JSON.stringify(data.metadata || {}),
          data.bbsScore,
          new Date(),
        ]
      );

      const detection = detectionResult.rows[0];

      // Insert detection items
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          await client.query(
            `INSERT INTO detection_items (
              detection_id, ppe_item_id, is_detected, confidence, bounding_box
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
              detection.id,
              item.ppeItemId,
              item.isDetected,
              item.confidence,
              JSON.stringify(item.boundingBox || {}),
            ]
          );
        }
      }

      // Create incident if violation
      if (data.status === 'violation') {
        await client.query(
          `INSERT INTO incidents (
            incident_code, detection_id, plant_id, zone_id,
            incident_type, severity, title, occurred_at, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            `INC-${Date.now()}`,
            detection.id,
            data.plantId,
            data.zoneId,
            'ppe_violation',
            data.severity || 'medium',
            `PPE Violation at ${data.zoneName || 'Zone'}`,
            data.timestamp || new Date(),
            'open',
          ]
        );
      }

      return detection;
    });
  }

  /**
   * Review a detection
   */
  async reviewDetection(
    id: string,
    reviewerId: string,
    reviewNotes: string,
    isFalsePositive: boolean
  ) {
    try {
      const result = await db.query(
        `UPDATE detections
        SET
          reviewed_by = $1,
          reviewed_at = $2,
          review_notes = $3,
          is_false_positive = $4,
          updated_at = $5
        WHERE id = $6
        RETURNING *`,
        [reviewerId, new Date(), reviewNotes, isFalsePositive, new Date(), id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Detection not found', 404);
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error reviewing detection:', error);
      throw error;
    }
  }

  /**
   * Delete detection
   */
  async deleteDetection(id: string) {
    try {
      const result = await db.query('DELETE FROM detections WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        throw new AppError('Detection not found', 404);
      }
    } catch (error) {
      logger.error('Error deleting detection:', error);
      throw error;
    }
  }

  /**
   * Get detection statistics
   */
  async getDetectionStats(filters: { plantId?: string; startDate?: string; endDate?: string }) {
    try {
      let query = `
        SELECT
          COUNT(*) as total_detections,
          COUNT(CASE WHEN status = 'compliant' THEN 1 END) as compliant_count,
          COUNT(CASE WHEN status = 'violation' THEN 1 END) as violation_count,
          COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning_count,
          ROUND(AVG(confidence_score), 2) as avg_confidence,
          ROUND(AVG(bbs_score), 2) as avg_bbs_score,
          ROUND(
            CAST(COUNT(CASE WHEN status = 'compliant' THEN 1 END) AS DECIMAL) /
            NULLIF(COUNT(*), 0) * 100,
            2
          ) as compliance_rate
        FROM detections
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramCount = 1;

      if (filters.plantId) {
        query += ` AND plant_id = $${paramCount}`;
        params.push(filters.plantId);
        paramCount++;
      }

      if (filters.startDate) {
        query += ` AND timestamp >= $${paramCount}`;
        params.push(filters.startDate);
        paramCount++;
      }

      if (filters.endDate) {
        query += ` AND timestamp <= $${paramCount}`;
        params.push(filters.endDate);
        paramCount++;
      }

      const result = await db.query(query, params);

      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching detection stats:', error);
      throw error;
    }
  }
}
