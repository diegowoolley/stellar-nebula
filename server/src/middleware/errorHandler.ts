import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Zod Validation Errors
    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Dados inválidos';
        return res.status(statusCode).json({
            status: 'error',
            statusCode,
            message,
            errors: err.issues.map((e: any) => ({
                path: e.path.join('.'),
                message: e.message
            }))
        });
    }

    console.error(`[Error] ${statusCode} - ${message}`);
    if (err.stack) console.error(err.stack);

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message
    });
};
