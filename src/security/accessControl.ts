import type { UserRole } from './token'

export type Permission =
  | 'game:play'
  | 'game:save'
  | 'game:refill-hearts'
  | 'admin:manage'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: ['game:play', 'game:save', 'game:refill-hearts'],
  admin: ['game:play', 'game:save', 'game:refill-hearts', 'admin:manage'],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function resolveRole(username: string, adminUsers: string[]): UserRole {
  return adminUsers.includes(username.toLowerCase()) ? 'admin' : 'user'
}
