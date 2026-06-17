const SENSITIVE_KEYS = new Set([
  'password',
  'senha',
  'token',
  'secret',
  'authorization',
  'cookie',
  'session',
  'creditcard',
  'cpf',
  'email',
  'phone',
  'telefone',
])

const REDACTED = '[REDACTED]'

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase()
  return [...SENSITIVE_KEYS].some((s) => lower.includes(s))
}

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') {
    if (value.length > 200) return `${value.slice(0, 200)}…[truncated]`
    return value
  }
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (typeof value === 'object') return sanitizeRecord(value as Record<string, unknown>)
  return value
}

function sanitizeRecord(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    out[key] = isSensitiveKey(key) ? REDACTED : sanitizeValue(value)
  }
  return out
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (import.meta.env.PROD && level === 'debug') return

  const payload = context ? sanitizeRecord(context) : undefined
  const line = payload ? `${message} ${JSON.stringify(payload)}` : message

  switch (level) {
    case 'debug':
      console.debug(`[LinguaPath] ${line}`)
      break
    case 'info':
      console.info(`[LinguaPath] ${line}`)
      break
    case 'warn':
      console.warn(`[LinguaPath] ${line}`)
      break
    case 'error':
      console.error(`[LinguaPath] ${line}`)
      break
  }
}

export const secureLog = {
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
}
