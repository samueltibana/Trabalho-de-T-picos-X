import { describe, expect, it } from 'vitest'
import {
  clampNumber,
  detectInjectionAttempt,
  isPlainObject,
  sanitizeText,
  validateAnswerInput,
  validateDateString,
  validateFlashcardField,
  validateLessonId,
  validatePassword,
  validateUsername,
} from './validation'

describe('sanitizeText', () => {
  it('strips control chars, angle brackets and trims', () => {
    expect(sanitizeText('  hello\x00<script>  ')).toBe('helloscript')
    expect(sanitizeText('a'.repeat(200), 10)).toHaveLength(10)
  })
})

describe('detectInjectionAttempt', () => {
  it('flags SQL and XSS patterns', () => {
    expect(detectInjectionAttempt("'; DROP TABLE users;--")).toBe(true)
    expect(detectInjectionAttempt('<script>alert(1)</script>')).toBe(true)
    expect(detectInjectionAttempt('hello world')).toBe(false)
  })
})

describe('validateUsername', () => {
  it('accepts valid usernames', () => {
    expect(validateUsername('Joao_123')).toEqual({
      valid: true,
      sanitized: 'joao_123',
    })
  })

  it('rejects short or invalid usernames', () => {
    expect(validateUsername('ab').valid).toBe(false)
    expect(validateUsername("admin'; DROP--").valid).toBe(false)
  })
})

describe('validatePassword', () => {
  it('enforces length bounds', () => {
    expect(validatePassword('short').valid).toBe(false)
    expect(validatePassword('validpass1').valid).toBe(true)
    expect(validatePassword('x'.repeat(129)).valid).toBe(false)
  })
})

describe('validateFlashcardField', () => {
  it('requires non-empty sanitized text', () => {
    expect(validateFlashcardField('  Olá  ', 'Frente')).toEqual({
      valid: true,
      sanitized: 'Olá',
    })
    expect(validateFlashcardField('   ', 'Frente')).toEqual({
      valid: false,
      error: 'Frente é obrigatório.',
    })
  })

  it('rejects injection in flashcard fields', () => {
    const result = validateFlashcardField('SELECT * FROM cards', 'Verso')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Verso')
  })
})

describe('validateAnswerInput', () => {
  it('accepts normal answers and rejects empty or malicious input', () => {
    expect(validateAnswerInput('Hello').valid).toBe(true)
    expect(validateAnswerInput('   ').valid).toBe(false)
    expect(validateAnswerInput('javascript:alert(1)').valid).toBe(false)
  })
})

describe('validateLessonId', () => {
  it('matches lesson-X-Y pattern only', () => {
    expect(validateLessonId('lesson-1-2')).toBe(true)
    expect(validateLessonId('lesson-1')).toBe(false)
    expect(validateLessonId('../etc/passwd')).toBe(false)
  })
})

describe('validateDateString', () => {
  it('accepts ISO date strings', () => {
    expect(validateDateString('2026-06-16')).toBe(true)
    expect(validateDateString('16-06-2026')).toBe(false)
  })
})

describe('clampNumber', () => {
  it('clamps and floors numbers with fallback', () => {
    expect(clampNumber(5.9, 0, 10, 0)).toBe(5)
    expect(clampNumber(99, 0, 10, 0)).toBe(10)
    expect(clampNumber('bad', 0, 10, 3)).toBe(3)
  })
})

describe('isPlainObject', () => {
  it('distinguishes plain objects from arrays and null', () => {
    expect(isPlainObject({ a: 1 })).toBe(true)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(null)).toBe(false)
  })
})
