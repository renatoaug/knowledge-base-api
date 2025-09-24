import type { NextFunction, Request, Response } from 'express'
import crypto from 'node:crypto'

export function RequestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('x-request-id') || req.header('X-Request-Id')
  const id = incoming || crypto.randomUUID()

  ;(req as unknown as { id: string }).id = id
  res.setHeader('X-Request-Id', id)
  res.locals.requestId = id

  next()
}
