import { RoleBasedPermissionStrategy, type Action } from 'src/security/permission'
import { UserRole } from 'src/models/user'

const actions: Action[] = ['topic:create', 'topic:read', 'topic:update', 'topic:delete']

describe('[unit] RoleBasedPermissionStrategy', () => {
  const strategy = new RoleBasedPermissionStrategy()

  const admin = { id: 'u1', name: 'A', email: 'a@a', role: UserRole.ADMIN, createdAt: Date.now() }
  const editor = { id: 'u2', name: 'E', email: 'e@e', role: UserRole.EDITOR, createdAt: Date.now() }
  const viewer = { id: 'u3', name: 'V', email: 'v@v', role: UserRole.VIEWER, createdAt: Date.now() }

  test('Admin can perform all actions', () => {
    for (const action of actions) {
      expect(strategy.can(admin, action)).toBe(true)
    }
  })

  test('Editor can create/read/update but not delete', () => {
    expect(strategy.can(editor, 'topic:create')).toBe(true)
    expect(strategy.can(editor, 'topic:read')).toBe(true)
    expect(strategy.can(editor, 'topic:update')).toBe(true)
    expect(strategy.can(editor, 'topic:delete')).toBe(false)
  })

  test('Viewer can only read', () => {
    expect(strategy.can(viewer, 'topic:create')).toBe(false)
    expect(strategy.can(viewer, 'topic:read')).toBe(true)
    expect(strategy.can(viewer, 'topic:update')).toBe(false)
    expect(strategy.can(viewer, 'topic:delete')).toBe(false)
  })
})
