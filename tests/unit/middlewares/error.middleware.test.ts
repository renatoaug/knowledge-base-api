import { ErrorMiddleware, AppError } from 'src/middlewares'

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
  })
})
