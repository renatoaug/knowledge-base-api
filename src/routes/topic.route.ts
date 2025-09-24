import { Router } from 'express'
import { makeTopicController } from 'src/container'
import { z } from 'zod'
import { ValidationMiddleware, AppError } from 'src/middlewares'
import { makeAuthMiddleware } from 'src/container'

const router = Router()
const controller = makeTopicController()
const auth = makeAuthMiddleware()

const createSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  parentTopicId: z.uuid().nullable().optional(),
})

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  parentTopicId: z.uuid().nullable().optional(),
})

const shortestPathQuerySchema = z.object({
  from: z.uuid(),
  to: z.uuid(),
})

router.post(
  '/',
  auth.authenticate,
  auth.authorize('topic:create'),
  ValidationMiddleware.validateBody(createSchema),
  controller.create,
)

router.put(
  '/:id',
  auth.authenticate,
  auth.authorize('topic:update'),
  ValidationMiddleware.validateBody(updateSchema),
  controller.update,
)

router.get(
  '/shortest-path',
  auth.authenticate,
  auth.authorize('topic:read'),
  (req, res, next) => {
    const parsed = shortestPathQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((iss) => ({
        field: iss.path.join('.') || undefined,
        message: iss.message,
      }))
      return next(new AppError(400, 'Validation error', { errors }))
    }

    const locals = res.locals as { shortestPathQuery?: { from: string; to: string } }
    locals.shortestPathQuery = parsed.data

    next()
  },
  controller.getShortestPath,
)

router.delete('/:id', auth.authenticate, auth.authorize('topic:delete'), controller.delete)

router.get('/:id', auth.authenticate, auth.authorize('topic:read'), controller.get)

router.get('/:id/tree', auth.authenticate, auth.authorize('topic:read'), controller.getTree)

export default router
