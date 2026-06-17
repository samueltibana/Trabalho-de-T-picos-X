export type UserRole = 'user' | 'admin'

export interface StoredUser {
  username: string
  passwordHash: string
  salt: string
  role: UserRole
  createdAt: string
}

export interface AuthSession {
  username: string
  role: UserRole
  expiresAt: number
}
