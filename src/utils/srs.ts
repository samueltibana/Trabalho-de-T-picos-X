import type { UserFlashcard } from '../types/flashcard'

/** Intervalos após acertos consecutivos: 3 → 7 → 14 → 28 → … dias */
export const CORRECT_INTERVALS = [3, 7, 14, 28, 56, 112] as const

/** Intervalo após erro */
export const WRONG_INTERVAL = 1

export function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(fromDate: string, days: number): string {
  const date = new Date(`${fromDate}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function getNextIntervalDays(correctStreak: number, wasCorrect: boolean): number {
  if (!wasCorrect) return WRONG_INTERVAL
  const index = Math.min(Math.max(correctStreak - 1, 0), CORRECT_INTERVALS.length - 1)
  return CORRECT_INTERVALS[index]
}

export function applyReview(card: UserFlashcard, wasCorrect: boolean, today = getToday()): UserFlashcard {
  if (wasCorrect) {
    const newStreak = card.correctStreak + 1
    const days = getNextIntervalDays(newStreak, true)
    return {
      ...card,
      correctStreak: newStreak,
      nextReviewDate: addDays(today, days),
      totalCorrect: card.totalCorrect + 1,
      lastReviewedAt: today,
    }
  }

  return {
    ...card,
    correctStreak: 0,
    nextReviewDate: addDays(today, WRONG_INTERVAL),
    totalWrong: card.totalWrong + 1,
    lastReviewedAt: today,
  }
}

export function isDue(card: UserFlashcard, today = getToday()): boolean {
  return card.nextReviewDate <= today
}

export function getDueCards(cards: UserFlashcard[], today = getToday()): UserFlashcard[] {
  return cards
    .filter((card) => isDue(card, today))
    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))
}

export function createNewCard(front: string, back: string, example?: string): UserFlashcard {
  const today = getToday()
  return {
    id: crypto.randomUUID(),
    front,
    back,
    example: example || undefined,
    createdAt: today,
    correctStreak: 0,
    nextReviewDate: today,
    totalCorrect: 0,
    totalWrong: 0,
    lastReviewedAt: null,
  }
}

export function computeStatistics(
  cards: UserFlashcard[],
  history: { date: string; correct: number; wrong: number }[],
  today = getToday(),
): {
  totalCorrect: number
  totalWrong: number
  pendingToday: number
  totalCards: number
  reviewedToday: number
} {
  const due = getDueCards(cards, today)
  const todayHistory = history.find((h) => h.date === today)

  return {
    totalCorrect: cards.reduce((sum, c) => sum + c.totalCorrect, 0),
    totalWrong: cards.reduce((sum, c) => sum + c.totalWrong, 0),
    pendingToday: due.length,
    totalCards: cards.length,
    reviewedToday: (todayHistory?.correct ?? 0) + (todayHistory?.wrong ?? 0),
  }
}

export function getEvolutionHistory(
  history: { date: string; correct: number; wrong: number }[],
  days = 14,
): { date: string; correct: number; wrong: number }[] {
  const today = getToday()
  const result: { date: string; correct: number; wrong: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i)
    const entry = history.find((h) => h.date === date)
    result.push({ date, correct: entry?.correct ?? 0, wrong: entry?.wrong ?? 0 })
  }

  return result
}
