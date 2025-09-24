export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: number
}
