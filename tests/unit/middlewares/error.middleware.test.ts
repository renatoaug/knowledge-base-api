import { ErrorMiddleware, AppError } from 'src/middlewares'
import { logger } from 'src/logger'

jest.mock('src/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}))

function makeRes() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('[unit] ErrorMiddleware', () => {
  it('returns 500 for unknown errors', () => {
    const res = makeRes()
    ErrorMiddleware.handle(new Error('boom'), {} as any, res as any, jest.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      statusCode: '500',
      details: null,
    })
    expect(logger.error).toHaveBeenCalled()
  })

  it('returns custom status for AppError', () => {
    const res = makeRes()
    const err = new AppError(418, 'I am a teapot')
    ErrorMiddleware.handle(err, {} as any, res as any, jest.fn())
    expect(res.status).toHaveBeenCalledWith(418)
    expect(res.json).toHaveBeenCalledWith({
      message: 'I am a teapot',
      statusCode: '418',
      details: null,
    })
    expect(logger.warn).toHaveBeenCalled()
  })

  it('logs warn with requestId for 400 AppError', () => {
    const res: any = makeRes()
    res.locals = { requestId: 'req-1' }
    const err = new AppError(400, 'Validation error', { errors: [] })
    ErrorMiddleware.handle(err, {} as any, res as any, jest.fn())
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: 'req-1', status: 400, message: 'Validation error' }),
      'AppError',
    )
  })

  it('logs error with requestId for 500 AppError', () => {
    const res: any = makeRes()
    res.locals = { requestId: 'req-2' }
    const err = new AppError(500, 'Failure')
    ErrorMiddleware.handle(err, {} as any, res as any, jest.fn())
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: 'req-2' }),
      'AppError',
    )
  })
})
