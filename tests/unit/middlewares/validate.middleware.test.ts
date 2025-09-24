import { ValidationMiddleware } from 'src/middlewares'
import { z } from 'zod'

describe('[unit] ValidationMiddleware', () => {
  it('passes when body is valid and rewrites req.body with parsed data', () => {
    const schema = z.object({ a: z.string().min(1), b: z.number() })
    const mw = ValidationMiddleware.validateBody(schema)

    const req: any = { body: { a: 'x', b: 2 } }
    const res: any = {}
    const next = jest.fn()

    mw(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.body).toEqual({ a: 'x', b: 2 })
  })
})
