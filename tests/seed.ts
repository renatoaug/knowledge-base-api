import { makeTopicRepositories } from 'src/infra/persistence'
import { User, UserRole } from 'src/models/user'

export type SeedUser = User & {
  token: string
}

export async function seedUsers(customUsers?: SeedUser[]): Promise<void> {
  const { userRepository } = makeTopicRepositories('file')
  const now = Date.now()

  const users: SeedUser[] =
    customUsers ??
    ([
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
    ] as SeedUser[])

  await userRepository.createMany(users)
}

async function main() {
  await seedUsers()
}

const isMain = typeof require !== 'undefined' && require.main === module

if (isMain) {
  main()
    .then(() => {
      console.info('[seed] Users created')
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
