import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errorHandler';
import { db } from '../database/connection';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roleId: string;
    roleName: string;
    plantId?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // Get user from database
    const result = await db.query(
      `SELECT u.id, u.email, u.role_id, r.name as role_name, u.plant_id, u.is_active
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 401);
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new AppError('User account is inactive', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name,
      plantId: user.plant_id,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      return next(
        new AppError('You do not have permission to access this resource', 403)
      );
    }

    next();
  };
};
