import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from 'src/middleware/error.middleware'

export function validateBody<T extends z.ZodTypeAny>(
  schema: T,
): (req: Request, _res: Response, next: NextFunction) => void {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((iss) => ({
        field: iss.path.join('.') || undefined,
        message: iss.message,
      }))
      return next(new AppError(400, 'Validation error', { errors }))
    }

    const r = req as unknown as { body: unknown }
    r.body = parsed.data as z.infer<T>

    next()
  }
}
