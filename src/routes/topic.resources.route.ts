import { Router } from 'express'
import { makeAuthMiddleware, makeResourceController } from 'src/container'
import { AppError } from 'src/middlewares'
import { z } from 'zod'

const router = Router({ mergeParams: true })
const auth = makeAuthMiddleware()
const controller = makeResourceController()

router.get(
  '/',
  auth.authenticate,
  auth.authorize('resource:read'),
  (req, _res, next) => {
    const parsed = z.uuid().safeParse(req.params.id)
    if (!parsed.success)
      return next(
        new AppError(400, 'Validation error', {
          errors: [{ field: 'id', message: parsed.error.issues[0]?.message }],
        }),
      )
    ;(req as unknown as { params: { topicId: string } }).params.topicId = req.params.id
    next()
  },
  controller.listByTopic,
)

export default router
