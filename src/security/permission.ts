import { User } from 'src/models/user'

export type Action =
  | 'topic:create'
  | 'topic:read'
  | 'topic:update'
  | 'topic:delete'
  | 'resource:create'
  | 'resource:read'
  | 'resource:update'
  | 'resource:delete'

export interface PermissionStrategy {
  can(user: User, action: Action): boolean
}

export class RoleBasedPermissionStrategy implements PermissionStrategy {
  can(user: User, action: Action): boolean {
    switch (user.role) {
      case 'admin':
        return true
      case 'editor':
        switch (action) {
          case 'topic:create':
          case 'topic:read':
          case 'topic:update':
          case 'resource:create':
          case 'resource:read':
          case 'resource:update':
            return true
          case 'topic:delete':
          case 'resource:delete':
            return false
        }
      case 'viewer':
        switch (action) {
          case 'topic:read':
          case 'resource:read':
            return true
          default:
            return false
        }
      default:
        return false
    }
  }
}
