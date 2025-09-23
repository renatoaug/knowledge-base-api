import { Router } from 'express'
import { makeTopicController } from 'src/container'
import { z } from 'zod'
import { ValidationMiddleware } from 'src/middleware'
import { makeAuthMiddleware } from 'src/container'
import { UserRole } from 'src/models/user'

const router = Router()
const controller = makeTopicController()
const auth = makeAuthMiddleware()

const createSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  parentTopicId: z.uuid().nullable().optional(),
})

router.post(
  '/',
  auth.authenticate,
  auth.authorize(UserRole.ADMIN, UserRole.EDITOR),
  ValidationMiddleware.validateBody(createSchema),
  controller.create,
)

export default router
