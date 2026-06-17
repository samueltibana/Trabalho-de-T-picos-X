import type { DailyHistoryEntry, FlashcardDeckState, UserFlashcard } from '../types/flashcard'
import { clampNumber, isPlainObject, validateDateString } from './validation'
import { getToday } from '../utils/srs'

const MAX_CARDS = 500
const MAX_HISTORY = 90
const MAX_TEXT = 200

function sanitizeText(value: unknown, max = MAX_TEXT): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001F\u007F]/g, '').replace(/[<>]/g, '').trim().slice(0, max)
}

function parseCard(raw: unknown): UserFlashcard | null {
  if (!isPlainObject(raw)) return null
  const front = sanitizeText(raw.front)
  const back = sanitizeText(raw.back)
  if (!front || !back) return null

  const id = typeof raw.id === 'string' && raw.id.length <= 64 ? raw.id : null
  if (!id) return null

  const example = raw.example ? sanitizeText(raw.example) : undefined
  const createdAt =
    typeof raw.createdAt === 'string' && validateDateString(raw.createdAt)
      ? raw.createdAt
      : getToday()
  const nextReviewDate =
    typeof raw.nextReviewDate === 'string' && validateDateString(raw.nextReviewDate)
      ? raw.nextReviewDate
      : getToday()
  const lastReviewedAt =
    typeof raw.lastReviewedAt === 'string' && validateDateString(raw.lastReviewedAt)
      ? raw.lastReviewedAt
      : null

  return {
    id,
    front,
    back,
    example: example || undefined,
    createdAt,
    correctStreak: clampNumber(raw.correctStreak, 0, 20, 0),
    nextReviewDate,
    totalCorrect: clampNumber(raw.totalCorrect, 0, 10_000, 0),
    totalWrong: clampNumber(raw.totalWrong, 0, 10_000, 0),
    lastReviewedAt,
  }
}

function parseHistoryEntry(raw: unknown): DailyHistoryEntry | null {
  if (!isPlainObject(raw)) return null
  if (typeof raw.date !== 'string' || !validateDateString(raw.date)) return null
  return {
    date: raw.date,
    correct: clampNumber(raw.correct, 0, 1000, 0),
    wrong: clampNumber(raw.wrong, 0, 1000, 0),
  }
}

export function parseFlashcardDeck(raw: unknown): FlashcardDeckState | null {
  if (!isPlainObject(raw)) return null

  const cards: UserFlashcard[] = []
  if (Array.isArray(raw.cards)) {
    for (const item of raw.cards.slice(0, MAX_CARDS)) {
      const parsed = parseCard(item)
      if (parsed) cards.push(parsed)
    }
  }

  const history: DailyHistoryEntry[] = []
  if (Array.isArray(raw.history)) {
    for (const item of raw.history.slice(-MAX_HISTORY)) {
      const parsed = parseHistoryEntry(item)
      if (parsed) history.push(parsed)
    }
  }

  return { cards, history }
}

export function deckStorageKey(username: string): string {
  return `linguapath-deck:${username.toLowerCase()}`
}
