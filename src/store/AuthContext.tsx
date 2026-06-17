import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { env } from '../config/env'
import { hasPermission, resolveRole } from '../security/accessControl'
import type { Permission } from '../security/accessControl'
import { secureLog } from '../security/logger'
import { hashPassword, verifyPassword } from '../security/password'
import { readSecureStorage, writeSecureStorage } from '../security/storage'
import { createSessionToken, validateSessionToken } from '../security/token'
import { validatePassword, validateUsername } from '../security/validation'
import type { AuthSession, StoredUser, UserRole } from '../types/auth'

const USERS_KEY = 'linguapath-users'
const SESSION_KEY = 'linguapath-session'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  can: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseUsers(raw: unknown): StoredUser[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (u): u is StoredUser =>
      typeof u === 'object' &&
      u !== null &&
      typeof (u as StoredUser).username === 'string' &&
      typeof (u as StoredUser).passwordHash === 'string' &&
      typeof (u as StoredUser).salt === 'string',
  )
}

function readUsers(): StoredUser[] {
  return readSecureStorage(USERS_KEY, parseUsers) ?? []
}

function saveUsers(users: StoredUser[]): void {
  writeSecureStorage(USERS_KEY, users)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    assertProductionSecretsSafe()
    restoreSession()
  }, [])

  async function restoreSession() {
    try {
      const token = sessionStorage.getItem(SESSION_KEY)
      if (!token) return

      const payload = await validateSessionToken(token)
      if (!payload) {
        sessionStorage.removeItem(SESSION_KEY)
        return
      }

      setSession({
        username: payload.username,
        role: payload.role,
        expiresAt: payload.expiresAt,
      })
    } catch {
      sessionStorage.removeItem(SESSION_KEY)
    } finally {
      setIsLoading(false)
    }
  }

  function assertProductionSecretsSafe() {
    try {
      if (import.meta.env.PROD && env.sessionSecret === 'dev-only-change-in-production') {
        secureLog.error('Segredo de sessão padrão detectado em produção')
      }
    } catch {
      /* noop */
    }
  }

  const persistSession = useCallback(async (username: string, role: UserRole) => {
    const token = await createSessionToken(username, role)
    sessionStorage.setItem(SESSION_KEY, token)
    const payload = await validateSessionToken(token)
    if (!payload) throw new Error('Falha ao criar sessão')

    setSession({
      username: payload.username,
      role: payload.role,
      expiresAt: payload.expiresAt,
    })
    secureLog.info('Sessão iniciada', { username, role })
  }, [])

  const login = useCallback(
    async (username: string, password: string) => {
      const userCheck = validateUsername(username)
      if (!userCheck.valid || !userCheck.sanitized) {
        return { ok: false, error: userCheck.error }
      }

      const passCheck = validatePassword(password)
      if (!passCheck.valid) {
        return { ok: false, error: passCheck.error }
      }

      const users = readUsers()
      const user = users.find((u) => u.username === userCheck.sanitized)
      if (!user) {
        secureLog.warn('Tentativa de login inválida', { username: userCheck.sanitized })
        return { ok: false, error: 'Usuário ou senha incorretos.' }
      }

      const valid = await verifyPassword(password, user.passwordHash, user.salt)
      if (!valid) {
        secureLog.warn('Senha incorreta', { username: userCheck.sanitized })
        return { ok: false, error: 'Usuário ou senha incorretos.' }
      }

      await persistSession(user.username, user.role)
      return { ok: true }
    },
    [persistSession],
  )

  const register = useCallback(
    async (username: string, password: string) => {
      const userCheck = validateUsername(username)
      if (!userCheck.valid || !userCheck.sanitized) {
        return { ok: false, error: userCheck.error }
      }

      const passCheck = validatePassword(password)
      if (!passCheck.valid) {
        return { ok: false, error: passCheck.error }
      }

      const users = readUsers()
      if (users.some((u) => u.username === userCheck.sanitized)) {
        return { ok: false, error: 'Usuário já existe.' }
      }

      const { hash, salt } = await hashPassword(password)
      const role = resolveRole(userCheck.sanitized, env.adminUsers)

      const newUser: StoredUser = {
        username: userCheck.sanitized,
        passwordHash: hash,
        salt,
        role,
        createdAt: new Date().toISOString(),
      }

      saveUsers([...users, newUser])
      await persistSession(newUser.username, newUser.role)
      secureLog.info('Conta criada', { username: newUser.username, role })
      return { ok: true }
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null)
    secureLog.info('Sessão encerrada')
  }, [])

  const can = useCallback(
    (permission: Permission) => {
      if (!session) return false
      return hasPermission(session.role, permission)
    },
    [session],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      isLoading,
      login,
      register,
      logout,
      can,
    }),
    [session, isLoading, login, register, logout, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
