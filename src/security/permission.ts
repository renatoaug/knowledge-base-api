import { User, UserRole } from 'src/models/user'

export type Action = 'topic:create' | 'topic:read' | 'topic:update' | 'topic:delete'

export interface PermissionStrategy {
  can(user: User, action: Action): boolean
}

export class RoleBasedPermissionStrategy implements PermissionStrategy {
  can(user: User, action: Action): boolean {
    switch (user.role) {
      case UserRole.ADMIN:
        return true
      case UserRole.EDITOR:
        return this.canEditor(action)
      case UserRole.VIEWER:
        return this.canViewer(action)
      default:
        return false
    }
  }

  private canEditor(action: Action): boolean {
    switch (action) {
      case 'topic:create':
      case 'topic:read':
      case 'topic:update':
        return true
      case 'topic:delete':
        return false
    }
  }

  private canViewer(action: Action): boolean {
    switch (action) {
      case 'topic:read':
        return true
      default:
        return false
    }
  }
}
