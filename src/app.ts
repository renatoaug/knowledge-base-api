import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { topicRoute } from 'src/routes'
import { ErrorMiddleware } from 'src/middlewares'
import { RequestIdMiddleware } from 'src/middlewares'
import pinoHttp from 'pino-http'
import { logger } from 'src/logger'

const app = express()
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(RequestIdMiddleware)
app.use(
  pinoHttp({
    logger,
    autoLogging: true,
    customProps: (req) => ({
      userId: (req as unknown as { user?: { id: string } }).user?.id,
      requestId: (req as unknown as { id: string }).id,
    }),
    customLogLevel: (_req, res, err): 'info' | 'warn' | 'error' => {
      if (err) return 'error'
      if (res.statusCode >= 500) return 'error'
      if (res.statusCode >= 400) return 'warn'
      return 'info'
    },
    customSuccessMessage: (req, res): string => {
      const green = '\x1b[32m'
      const red = '\x1b[31m'
      const reset = '\x1b[0m'
      const code = res.statusCode
      const color = code >= 400 ? red : green
      const colored = `${color}${code}${reset}`
      return `${colored} ${req.method} ${req.url}`
    },
    customErrorMessage: (req, res, err): string => {
      const red = '\x1b[31m'
      const reset = '\x1b[0m'
      const status = res.statusCode || 500
      const colored = `${red}${status}${reset}`
      const msg = err && (err as Error).message ? ` - ${(err as Error).message}` : ''
      return `${colored} ${req.method} ${req.url}${msg}`
    },
    serializers: {
      req: (req): { id: string; method: string; url: string } => ({
        id: (req as unknown as { id: string }).id,
        method: req.method,
        url: req.url,
      }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
)

app.get('/health', (_req, res): void => {
  res.json({ status: 'ok' })
})

app.use('/topics', topicRoute)

app.use(ErrorMiddleware.handle)

export default app
