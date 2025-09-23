import { Router } from 'express'
import { makeTopicController } from 'src/container'

const router = Router()
const controller = makeTopicController()

router.post('/', controller.create)

export default router
