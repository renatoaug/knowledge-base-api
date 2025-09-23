export enum UserRole {
  ADMIN = 'Admin',
  EDITOR = 'Editor',
  VIEWER = 'Viewer',
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: number
}
