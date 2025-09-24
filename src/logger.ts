import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, singleLine: false, translateTime: 'SYS:standard' },
      }
    : undefined,
  redact: {
    paths: ['req.headers.authorization', 'headers.authorization', 'password', 'token'],
    censor: '[REDACTED]',
  },
})
