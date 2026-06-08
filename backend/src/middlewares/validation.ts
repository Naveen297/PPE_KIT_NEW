import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

export const validateRequest = (schema: Joi.Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');

      throw new AppError(`Validation error: ${errorMessage}`, 400);
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
};
