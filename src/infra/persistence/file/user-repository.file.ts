import { readJsonFile, writeJsonFile } from 'src/utils/fs-json'
import { User } from 'src/models/user'
import { IUserRepository } from 'src/repositories'

type UserStore = { users: (User & { token: string })[] }
const USER_FILE = 'users.json'

export class UserRepositoryFile implements IUserRepository {
  async findByToken(token: string): Promise<User | null> {
    const store = await readJsonFile<UserStore>(USER_FILE, { users: [] })
    const user = store.users.find((u) => u.token === token)

    return user || null
  }

  async createMany(users: (User & { token: string })[]): Promise<void> {
    await writeJsonFile(USER_FILE, { users })
  }
}
