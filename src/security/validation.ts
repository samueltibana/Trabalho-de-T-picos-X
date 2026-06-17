const INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/i,
  /(--|\/\*|\*\/|;)/,
  /(<script|javascript:|on\w+\s*=)/i,
  /\$\{|\{\{/,
]

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/
const LESSON_ID_PATTERN = /^lesson-\d+-\d+$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export interface ValidationResult {
  valid: boolean
  error?: string
  sanitized?: string
}

export function detectInjectionAttempt(value: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(value))
}

export function sanitizeText(value: string, maxLength = 120): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength)
}

export function validateAnswerInput(value: string): ValidationResult {
  const sanitized = sanitizeText(value, 120)
  if (!sanitized) return { valid: false, error: 'Resposta vazia.' }
  if (detectInjectionAttempt(sanitized)) {
    return { valid: false, error: 'Entrada contém caracteres não permitidos.' }
  }
  return { valid: true, sanitized }
}

export function validateUsername(value: string): ValidationResult {
  const sanitized = sanitizeText(value, 32).toLowerCase()
  if (!USERNAME_PATTERN.test(sanitized)) {
    return {
      valid: false,
      error: 'Usuário deve ter 3–32 caracteres (letras, números, . _ -).',
    }
  }
  if (detectInjectionAttempt(sanitized)) {
    return { valid: false, error: 'Nome de usuário inválido.' }
  }
  return { valid: true, sanitized }
}

export function validatePassword(value: string): ValidationResult {
  if (value.length < 8) {
    return { valid: false, error: 'Senha deve ter no mínimo 8 caracteres.' }
  }
  if (value.length > 128) {
    return { valid: false, error: 'Senha muito longa.' }
  }
  if (detectInjectionAttempt(value)) {
    return { valid: false, error: 'Senha contém caracteres não permitidos.' }
  }
  return { valid: true, sanitized: value }
}

export function validateFlashcardField(value: string, label: string): ValidationResult {
  const sanitized = sanitizeText(value, 200)
  if (!sanitized) return { valid: false, error: `${label} é obrigatório.` }
  if (detectInjectionAttempt(sanitized)) {
    return { valid: false, error: `${label} contém caracteres não permitidos.` }
  }
  return { valid: true, sanitized }
}

export function validateLessonId(id: string): boolean {
  return LESSON_ID_PATTERN.test(id)
}

export function validateDateString(value: string): boolean {
  return DATE_PATTERN.test(value)
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.min(max, Math.max(min, Math.floor(value)))
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
