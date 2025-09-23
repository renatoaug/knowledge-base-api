import { User } from 'src/models/user'

export interface IUserRepository {
  findByToken(token: string): Promise<User | null>
  createMany(users: (User & { token: string })[]): Promise<void>
}
