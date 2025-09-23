import { Router } from 'express'
import { makeTopicController } from 'src/container'
import { z } from 'zod'
import { validateBody } from 'src/middleware/validate.middleware'

const router = Router()
const controller = makeTopicController()

const createSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  parentTopicId: z.uuid().nullable().optional(),
})

router.post('/', validateBody(createSchema), controller.create)

export default router
