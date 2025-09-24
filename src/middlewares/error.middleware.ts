import type { NextFunction, Request, Response } from 'express'
import { logger } from 'src/logger'

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
    const requestId = res.locals?.requestId
    if (err instanceof AppError) {
      const status = err.status
      if (status >= 500) {
        logger.error({ err, requestId }, 'AppError')
      } else {
        logger.warn(
          {
            requestId,
            status,
            message: err.message,
            details: err.details ?? null,
          },
          'AppError',
        )
      }

      res.status(err.status).json({
        message: err.message,
        statusCode: String(err.status),
        details: err.details ?? null,
      })

      return
    }

    logger.error({ err, requestId }, 'Unhandled error')

    res.status(500).json({ message: 'Internal Server Error', statusCode: '500', details: null })
  }
}
