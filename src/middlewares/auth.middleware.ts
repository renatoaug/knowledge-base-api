import type { NextFunction, Request, Response } from 'express'
import { User } from 'src/models/user'
import { IUserRepository } from 'src/repositories'
import type { Action, PermissionStrategy } from 'src/security/permission'
import { AppError } from 'src/middlewares'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export class AuthMiddleware {
  constructor(
    private readonly users: IUserRepository,
    private readonly permissions: PermissionStrategy,
  ) {}

  authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.header('authorization') || ''

    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
    if (!token) return next(new AppError(401, 'Unauthorized'))

    const user = await this.users.findByToken(token)
    if (!user) return next(new AppError(401, 'Unauthorized'))

    req.user = user
    next()
  }

  authorize = (action: Action) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError(401, 'Unauthorized'))
      if (!this.permissions.can(req.user, action)) {
        return next(new AppError(403, 'Forbidden'))
      }

      next()
    }
  }
}
