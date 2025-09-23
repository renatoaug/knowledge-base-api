import { Router } from 'express'
import { makeTopicController } from 'src/container'
import { z } from 'zod'
import { ValidationMiddleware } from 'src/middlewares'
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

export default router
