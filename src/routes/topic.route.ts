import { Router } from 'express'
import { makeTopicController, makeAuthMiddleware } from 'src/container'
import { CreateTopicSchema, UpdateTopicSchema, ShortestPathQuery } from 'src/schemas'
import { ValidationMiddleware, AppError } from 'src/middlewares'
import topicResourcesRoute from './topic.resources.route'

const router = Router()
const controller = makeTopicController()
const auth = makeAuthMiddleware()

const createSchema = CreateTopicSchema
const updateSchema = UpdateTopicSchema

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
  '/shortest_path',
  auth.authenticate,
  auth.authorize('topic:read'),
  (req, res, next) => {
    const parsed = ShortestPathQuery.safeParse(req.query)
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

router.use('/:id/resources', topicResourcesRoute)

export default router
