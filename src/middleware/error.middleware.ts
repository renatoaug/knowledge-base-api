import type { NextFunction, Request, Response } from 'express'

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
  }
}

export class ErrorMiddleware {
  static handle(
    err: unknown,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
  ): void {
    if (err instanceof AppError) {
      res.status(err.status).json({
        message: err.message,
        statusCode: String(err.status),
        details: err.details ?? null,
      })
      return
    }

    res.status(500).json({ message: 'Internal Server Error', statusCode: '500', details: null })
  }
}
