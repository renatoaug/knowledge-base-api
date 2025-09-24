import { Router } from 'express'
import { makeAuthMiddleware, makeResourceController } from 'src/container'
import { z } from 'zod'
import { ValidationMiddleware } from 'src/middlewares'

const router = Router()
const controller = makeResourceController()
const auth = makeAuthMiddleware()

const createSchema = z.object({
  topicId: z.uuid(),
  url: z.url(),
  description: z.string().min(1),
  type: z.enum(['video', 'article', 'pdf', 'link']),
})

const updateSchema = z.object({
  url: z.url().optional(),
  description: z.string().min(1).optional(),
  type: z.enum(['video', 'article', 'pdf', 'link']).optional(),
})

router.post(
  '/',
  auth.authenticate,
  auth.authorize('resource:create'),
  ValidationMiddleware.validateBody(createSchema),
  controller.create,
)

router.put(
  '/:id',
  auth.authenticate,
  auth.authorize('resource:update'),
  ValidationMiddleware.validateBody(updateSchema),
  controller.update,
)

router.delete('/:id', auth.authenticate, auth.authorize('resource:delete'), controller.delete)

router.get('/:id', auth.authenticate, auth.authorize('resource:read'), controller.get)

export default router
