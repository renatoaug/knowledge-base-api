import { UserRole } from 'src/models/user'
import { UserRepositoryFile } from 'src/infra/persistence/file'

describe('[integration] UserRepositoryFile', () => {
  it('createMany then findByToken returns the user', async () => {
    const repo = new UserRepositoryFile()
    const now = Date.now()
    await repo.createMany([
      {
        id: 'u-admin',
        name: 'Admin',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        createdAt: now,
        token: 'admin-token',
      },
      {
        id: 'u-editor',
        name: 'Editor',
        email: 'editor@example.com',
        role: UserRole.EDITOR,
        createdAt: now,
        token: 'editor-token',
      },
      {
        id: 'u-viewer',
        name: 'Viewer',
        email: 'viewer@example.com',
        role: UserRole.VIEWER,
        createdAt: now,
        token: 'viewer-token',
      },
    ])

    const u1 = await repo.findByToken('editor-token')
    expect(u1).toBeTruthy()
    expect(u1?.id).toBe('u-editor')
    expect(u1?.role).toBe(UserRole.EDITOR)

    const u2 = await repo.findByToken('nope')
    expect(u2).toBeNull()
  })
})
