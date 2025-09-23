/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from 'express'
import { AuthMiddleware, AppError } from 'src/middlewares'
import type { IUserRepository } from 'src/repositories'
import { UserRole } from 'src/models/user'
import { RoleBasedPermissionStrategy } from 'src/security/permission'

function createReq(headers?: Record<string, string>, user?: unknown): Request {
  const h = Object.fromEntries(Object.entries(headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]))
  const req = {
    headers: h,
    header: (name: string) => h[name.toLowerCase()],
    get: (name: string) => h[name.toLowerCase()],
  } as unknown as Request

  if (user) (req as any).user = user
  return req
}

function createRes(): Response {
  return {} as Response
}

function createNext() {
  const next = jest.fn() as unknown as NextFunction
  return next
}

describe('[unit] AuthMiddleware', () => {
  const validUser = {
    id: 'u-editor',
    name: 'Editor',
    email: 'editor@example.com',
    role: UserRole.EDITOR,
    createdAt: Date.now(),
  }

  test('[authenticate] 401 when Authorization header is missing', async () => {
    const repo: Partial<IUserRepository> = { findByToken: jest.fn(async () => null) }
    const auth = new AuthMiddleware(repo as IUserRepository, new RoleBasedPermissionStrategy())
    const req = createReq()
    const res = createRes()
    const next = createNext()

    await auth.authenticate(req, res, next)

    expect((repo.findByToken as jest.Mock).mock.calls.length).toBe(0)
    expect((next as any).mock.calls[0][0]).toBeInstanceOf(AppError)
    const err = (next as any).mock.calls[0][0] as AppError
    expect(err.status).toBe(401)
  })

  test('[authenticate] 401 when token is invalid', async () => {
    const repo: Partial<IUserRepository> = { findByToken: jest.fn(async () => null) }
    const auth = new AuthMiddleware(repo as IUserRepository, new RoleBasedPermissionStrategy())
    const req = createReq({ authorization: 'Bearer bad-token' })
    const res = createRes()
    const next = createNext()

    await auth.authenticate(req, res, next)

    expect(repo.findByToken).toHaveBeenCalledWith('bad-token')
    const err = (next as any).mock.calls[0][0] as AppError
    expect(err.status).toBe(401)
  })

  test('[authenticate] sets req.user and calls next on success', async () => {
    const repo: Partial<IUserRepository> = { findByToken: jest.fn(async () => validUser) }
    const auth = new AuthMiddleware(repo as IUserRepository, new RoleBasedPermissionStrategy())
    const req = createReq({ authorization: 'Bearer good-token' })
    const res = createRes()
    const next = createNext()

    await auth.authenticate(req, res, next)

    expect(repo.findByToken).toHaveBeenCalledWith('good-token')
    expect((req as any).user).toMatchObject({ id: 'u-editor', role: UserRole.EDITOR })
    expect((next as any).mock.calls[0][0]).toBeUndefined()
  })

  test('[authorize] 401 when req.user is missing', () => {
    const repo: Partial<IUserRepository> = { findByToken: jest.fn(async () => null) }
    const auth = new AuthMiddleware(repo as IUserRepository, new RoleBasedPermissionStrategy())
    const guard = auth.authorize('topic:delete')
    const req = createReq()
    const res = createRes()
    const next = createNext()

    guard(req, res, next)

    const err = (next as any).mock.calls[0][0] as AppError
    expect(err.status).toBe(401)
  })

  test('[authorize] 403 when user has insufficient role', () => {
    const repo: Partial<IUserRepository> = { findByToken: jest.fn(async () => null) }
    const auth = new AuthMiddleware(repo as IUserRepository, new RoleBasedPermissionStrategy())
    const guard = auth.authorize('topic:delete')
    const req = createReq({}, validUser)
    const res = createRes()
    const next = createNext()

    guard(req, res, next)

    const err = (next as any).mock.calls[0][0] as AppError
    expect(err.status).toBe(403)
  })

  test('[authorize] calls next when user has allowed role', () => {
    const repo: Partial<IUserRepository> = { findByToken: jest.fn(async () => null) }
    const auth = new AuthMiddleware(repo as IUserRepository, new RoleBasedPermissionStrategy())
    const guard = auth.authorize('topic:create')
    const req = createReq({}, validUser)
    const res = createRes()
    const next = createNext()

    guard(req, res, next)

    expect((next as any).mock.calls[0][0]).toBeUndefined()
  })
})
