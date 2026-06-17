import { describe, expect, it } from 'vitest'
import { assertSafeIdentifier, buildParameterizedQuery, buildSafeApiUrl } from './query'

describe('buildParameterizedQuery', () => {
  it('replaces named placeholders with positional params', () => {
    const { sql, values } = buildParameterizedQuery(
      'SELECT * FROM cards WHERE user = :userId AND due <= :dueDate',
      [
        { name: 'userId', value: 'joao' },
        { name: 'dueDate', value: '2026-06-16' },
      ],
    )

    expect(sql).toBe('SELECT * FROM cards WHERE user = $1 AND due <= $2')
    expect(values).toEqual(['joao', '2026-06-16'])
  })

  it('rejects unsafe parameter names', () => {
    expect(() =>
      buildParameterizedQuery('SELECT :bad_name', [{ name: 'bad;drop', value: 'x' }]),
    ).toThrow(/Identificador inválido/)
  })
})

describe('buildSafeApiUrl', () => {
  it('builds URL with encoded query params', () => {
    const url = buildSafeApiUrl('https://api.example.com', '/cards', [
      { name: 'status', value: 'due' },
      { name: 'limit', value: 10 },
    ])

    expect(url).toBe('https://api.example.com/cards?status=due&limit=10')
  })

  it('assertSafeIdentifier blocks injection in param names', () => {
    expect(() => assertSafeIdentifier('user;drop')).toThrow()
  })
})
