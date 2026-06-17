const DEFAULT_SESSION_TTL_HOURS = 24
const DEFAULT_SESSION_SECRET = 'dev-only-change-in-production'

function readEnv(key: string): string | undefined {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

export const env = {
  sessionSecret: readEnv('VITE_SESSION_SECRET') ?? DEFAULT_SESSION_SECRET,
  sessionTtlHours: Number(readEnv('VITE_SESSION_TTL_HOURS') ?? DEFAULT_SESSION_TTL_HOURS),
  adminUsers: (readEnv('VITE_ADMIN_USERS') ?? '')
    .split(',')
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean),
  apiBaseUrl: readEnv('VITE_API_BASE_URL') ?? '',
  isDev: import.meta.env.DEV,
} as const

export function assertProductionSecrets(): void {
  if (!import.meta.env.PROD) return
  if (env.sessionSecret === DEFAULT_SESSION_SECRET) {
    throw new Error('VITE_SESSION_SECRET deve ser definido em produção.')
  }
}
