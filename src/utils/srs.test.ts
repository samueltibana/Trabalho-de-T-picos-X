import { describe, expect, it } from 'vitest'
import {
  CORRECT_INTERVALS,
  WRONG_INTERVAL,
  addDays,
  applyReview,
  computeStatistics,
  createNewCard,
  getDueCards,
  getEvolutionHistory,
  getNextIntervalDays,
  getToday,
  isDue,
} from './srs'

const TODAY = '2026-06-16'

function cardDueOn(front: string, back: string, reviewDate: string) {
  const card = createNewCard(front, back)
  card.nextReviewDate = reviewDate
  return card
}

describe('SRS intervals (MOB-03)', () => {
  it('schedules wrong answers for 1 day', () => {
    expect(WRONG_INTERVAL).toBe(1)
    expect(getNextIntervalDays(0, false)).toBe(1)
  })

  it('follows 3 → 7 → 14 → 28 → … after consecutive correct answers', () => {
    expect(getNextIntervalDays(1, true)).toBe(3)
    expect(getNextIntervalDays(2, true)).toBe(7)
    expect(getNextIntervalDays(3, true)).toBe(14)
    expect(getNextIntervalDays(4, true)).toBe(28)
    expect(getNextIntervalDays(5, true)).toBe(56)
    expect(getNextIntervalDays(99, true)).toBe(CORRECT_INTERVALS[CORRECT_INTERVALS.length - 1])
  })
})

describe('addDays', () => {
  it('adds days without timezone drift', () => {
    expect(addDays('2026-06-16', 3)).toBe('2026-06-19')
    expect(addDays('2026-06-16', 7)).toBe('2026-06-23')
  })
})

describe('applyReview', () => {
  it('resets streak and schedules 1 day after a wrong answer', () => {
    const card = createNewCard('Olá', 'Hello')
    card.correctStreak = 3
    card.totalCorrect = 5

    const reviewed = applyReview(card, false, TODAY)

    expect(reviewed.correctStreak).toBe(0)
    expect(reviewed.nextReviewDate).toBe(addDays(TODAY, 1))
    expect(reviewed.totalWrong).toBe(1)
    expect(reviewed.totalCorrect).toBe(5)
    expect(reviewed.lastReviewedAt).toBe(TODAY)
  })

  it('increments streak and schedules next interval after a correct answer', () => {
    const card = createNewCard('Olá', 'Hello')

    const first = applyReview(card, true, TODAY)
    expect(first.correctStreak).toBe(1)
    expect(first.nextReviewDate).toBe(addDays(TODAY, 3))
    expect(first.totalCorrect).toBe(1)

    const second = applyReview(first, true, TODAY)
    expect(second.correctStreak).toBe(2)
    expect(second.nextReviewDate).toBe(addDays(TODAY, 7))
    expect(second.totalCorrect).toBe(2)
  })
})

describe('createNewCard', () => {
  it('creates a card due today with optional example', () => {
    const card = createNewCard('  Olá  ', 'Hello', '  Hi there  ')

    expect(card.front).toBe('  Olá  ')
    expect(card.back).toBe('Hello')
    expect(card.example).toBe('  Hi there  ')
    expect(card.nextReviewDate).toBe(getToday())
    expect(card.correctStreak).toBe(0)
    expect(card.totalCorrect).toBe(0)
    expect(card.totalWrong).toBe(0)
  })

  it('omits empty example', () => {
    const card = createNewCard('A', 'B', '')
    expect(card.example).toBeUndefined()
  })
})

describe('getDueCards / isDue', () => {
  it('returns only cards due on or before today, oldest first', () => {
    const dueToday = cardDueOn('A', 'B', TODAY)

    const dueYesterday = cardDueOn('C', 'D', addDays(TODAY, -1))

    const future = cardDueOn('E', 'F', addDays(TODAY, 3))

    const due = getDueCards([future, dueToday, dueYesterday], TODAY)

    expect(due).toHaveLength(2)
    expect(due[0].front).toBe('C')
    expect(due[1].front).toBe('A')
    expect(isDue(future, TODAY)).toBe(false)
  })
})

describe('computeStatistics', () => {
  it('aggregates totals, pending and today reviews', () => {
    const c1 = cardDueOn('A', 'B', TODAY)
    c1.totalCorrect = 4
    c1.totalWrong = 1

    const c2 = cardDueOn('C', 'D', addDays(TODAY, 5))
    c2.totalCorrect = 2

    const stats = computeStatistics(
      [c1, c2],
      [{ date: TODAY, correct: 2, wrong: 1 }],
      TODAY,
    )

    expect(stats.totalCorrect).toBe(6)
    expect(stats.totalWrong).toBe(1)
    expect(stats.pendingToday).toBe(1)
    expect(stats.totalCards).toBe(2)
    expect(stats.reviewedToday).toBe(3)
  })
})

describe('getEvolutionHistory', () => {
  it('fills missing days with zeroes', () => {
    const today = getToday()
    const history = getEvolutionHistory([{ date: today, correct: 3, wrong: 1 }], 3)

    expect(history).toHaveLength(3)
    expect(history[2]).toEqual({ date: today, correct: 3, wrong: 1 })
    expect(history[0].correct).toBe(0)
    expect(history[0].wrong).toBe(0)
  })
})

describe('MOB-03 acceptance flow', () => {
  it('updates schedule and selects due cards across review cycles', () => {
    const card = cardDueOn('Gato', 'Cat', TODAY)
    expect(getDueCards([card], TODAY)).toHaveLength(1)

    const afterCorrect = applyReview(card, true, TODAY)
    expect(getDueCards([afterCorrect], TODAY)).toHaveLength(0)
    expect(getDueCards([afterCorrect], addDays(TODAY, 3))).toHaveLength(1)

    const afterWrong = applyReview(afterCorrect, false, addDays(TODAY, 3))
    expect(afterWrong.nextReviewDate).toBe(addDays(TODAY, 4))
    expect(getDueCards([afterWrong], addDays(TODAY, 4))).toHaveLength(1)
  })
})
