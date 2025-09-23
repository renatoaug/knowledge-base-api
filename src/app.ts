import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { topicRoute } from 'src/routes'
import { ErrorMiddleware } from 'src/middleware'

const app = express()
app.use(express.json())
app.use(cors())
app.use(helmet())

app.get('/health', (_req, res): void => {
  res.json({ status: 'ok' })
})

app.use('/topics', topicRoute)

app.use(ErrorMiddleware.handle)

export default app
