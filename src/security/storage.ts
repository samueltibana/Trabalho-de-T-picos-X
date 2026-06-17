import { getAllLessons } from '../data/lessons'
import type { GameState, LessonProgress } from '../types'
import {
  clampNumber,
  isPlainObject,
  validateDateString,
  validateLessonId,
} from './validation'
import { secureLog } from './logger'

const MAX_XP = 1_000_000
const MAX_HEARTS = 10

function validateLessonProgress(value: unknown): LessonProgress | null {
  if (!isPlainObject(value)) return null
  return {
    completed: value.completed === true,
    stars: clampNumber(value.stars, 0, 3, 0),
    bestScore: clampNumber(value.bestScore, 0, 999, 0),
  }
}

export function parseGameState(raw: unknown): GameState | null {
  if (!isPlainObject(raw)) return null

  const validLessonIds = new Set(getAllLessons().map((l) => l.id))
  const completedLessons: Record<string, LessonProgress> = {}

  if (isPlainObject(raw.completedLessons)) {
    for (const [lessonId, progress] of Object.entries(raw.completedLessons)) {
      if (!validateLessonId(lessonId) || !validLessonIds.has(lessonId)) continue
      const parsed = validateLessonProgress(progress)
      if (parsed) completedLessons[lessonId] = parsed
    }
  }

  const dailyRaw = isPlainObject(raw.dailyStats) ? raw.dailyStats : {}
  const date =
    typeof dailyRaw.date === 'string' && validateDateString(dailyRaw.date)
      ? dailyRaw.date
      : new Date().toISOString().slice(0, 10)

  const missionProgress: Record<string, number> = {}
  if (isPlainObject(raw.missionProgress)) {
    for (const [key, val] of Object.entries(raw.missionProgress)) {
      if (!/^mission-[a-z-]+$/.test(key)) continue
      missionProgress[key] = clampNumber(val, 0, 10_000, 0)
    }
  }

  const lastPlayedDate =
    typeof raw.lastPlayedDate === 'string' && validateDateString(raw.lastPlayedDate)
      ? raw.lastPlayedDate
      : null

  return {
    hearts: clampNumber(raw.hearts, 0, MAX_HEARTS, 5),
    maxHearts: clampNumber(raw.maxHearts, 1, MAX_HEARTS, 5),
    xp: clampNumber(raw.xp, 0, MAX_XP, 0),
    streak: clampNumber(raw.streak, 0, 9999, 0),
    level: clampNumber(raw.level, 1, 999, 1),
    completedLessons,
    dailyStats: {
      date,
      lessonsCompleted: clampNumber(dailyRaw.lessonsCompleted, 0, 100, 0),
      correctAnswers: clampNumber(dailyRaw.correctAnswers, 0, 10_000, 0),
      xpEarned: clampNumber(dailyRaw.xpEarned, 0, MAX_XP, 0),
    },
    missionProgress,
    lastPlayedDate,
  }
}

export function readSecureStorage<T>(
  key: string,
  parser: (raw: unknown) => T | null,
): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return parser(parsed)
  } catch (error) {
    secureLog.warn('Falha ao ler storage — dados ignorados', {
      key,
      error: error instanceof Error ? error.message : 'unknown',
    })
    return null
  }
}

export function writeSecureStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    secureLog.error('Falha ao gravar storage', {
      key,
      error: error instanceof Error ? error.message : 'unknown',
    })
  }
}

export function gameStorageKey(username: string): string {
  return `linguapath-game:${username.toLowerCase()}`
}
