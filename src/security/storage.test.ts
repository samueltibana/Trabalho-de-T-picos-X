import { beforeEach, describe, expect, it, vi } from 'vitest'
import { gameStorageKey, parseGameState, readSecureStorage, writeSecureStorage } from './storage'

function createLocalStorageMock() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  }
}

describe('parseGameState', () => {
  it('parses valid game state and ignores invalid lesson ids', () => {
    const parsed = parseGameState({
      hearts: 3,
      xp: 150,
      completedLessons: {
        'lesson-1-1': { completed: true, stars: 3, bestScore: 5 },
        'invalid-id': { completed: true, stars: 1, bestScore: 1 },
      },
      dailyStats: { date: '2026-06-16', lessonsCompleted: 1, correctAnswers: 5, xpEarned: 10 },
      missionProgress: { 'mission-daily-lessons': 2, 'bad key': 99 },
    })

    expect(parsed?.hearts).toBe(3)
    expect(parsed?.xp).toBe(150)
    expect(Object.keys(parsed!.completedLessons)).toEqual(['lesson-1-1'])
    expect(parsed?.missionProgress['mission-daily-lessons']).toBe(2)
    expect(parsed?.missionProgress['bad key']).toBeUndefined()
  })

  it('clamps out-of-range values', () => {
    const parsed = parseGameState({
      hearts: 999,
      xp: -10,
      maxHearts: 0,
    })

    expect(parsed?.hearts).toBe(10)
    expect(parsed?.xp).toBe(0)
    expect(parsed?.maxHearts).toBe(1)
  })

  it('returns null for invalid root', () => {
    expect(parseGameState(null)).toBeNull()
    expect(parseGameState([])).toBeNull()
  })
})

describe('readSecureStorage / writeSecureStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
  })

  it('roundtrips parsed data', () => {
    writeSecureStorage('test-key', { hearts: 5 })
    const result = readSecureStorage('test-key', parseGameState)

    expect(result?.hearts).toBe(5)
  })

  it('returns null for invalid JSON', () => {
    localStorage.setItem('bad', '{not json')
    expect(readSecureStorage('bad', parseGameState)).toBeNull()
  })
})

describe('gameStorageKey', () => {
  it('namespaces game state by username', () => {
    expect(gameStorageKey('Maria')).toBe('linguapath-game:maria')
  })
})
