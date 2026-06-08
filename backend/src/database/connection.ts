import { Pool, PoolClient, QueryResult } from 'pg';
import { config } from '../config';
import { logger } from '../utils/logger';

// Create PostgreSQL connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  min: config.database.poolMin,
  max: config.database.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
});

// Event handlers
pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
});

// Database interface
export const db = {
  /**
   * Execute a query
   */
  query: async (text: string, params?: any[]): Promise<QueryResult> => {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug(`Query executed in ${duration}ms`);
      return result;
    } catch (error) {
      logger.error('Database query error:', { text, params, error });
      throw error;
    }
  },

  /**
   * Get a client from the pool for transactions
   */
  getClient: async (): Promise<PoolClient> => {
    return await pool.connect();
  },

  /**
   * Execute a transaction
   */
  transaction: async <T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Close all database connections
   */
  end: async (): Promise<void> => {
    await pool.end();
    logger.info('Database pool closed');
  },

  /**
   * Get pool status
   */
  getPoolStatus: () => {
    return {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
  },
};

export default db;
