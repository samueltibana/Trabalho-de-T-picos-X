import { describe, expect, it } from 'vitest'
import type { Lesson } from '../types'
import {
  buildQuestions,
  calcStars,
  calcXp,
  checkAnswer,
  getQuestionLabel,
  levelFromXp,
  normalizeAnswer,
  xpProgressInLevel,
} from './game'

const sampleLesson: Lesson = {
  id: 'lesson-1-1',
  unitId: 'unit-1',
  title: 'Test',
  description: 'Test lesson',
  difficulty: 2,
  xpReward: 10,
  cards: [
    { id: 'c1', pt: 'Olá', en: 'Hello' },
    { id: 'c2', pt: 'Sim', en: 'Yes' },
  ],
  questionTypes: ['choice-to-en', 'type-answer'],
}

describe('normalizeAnswer / checkAnswer', () => {
  it('ignores case, accents and punctuation', () => {
    expect(normalizeAnswer('  HELLO!!!  ')).toBe('hello')
    expect(normalizeAnswer('café')).toBe('cafe')
    expect(checkAnswer('hello', 'Hello')).toBe(true)
    expect(checkAnswer('wrong', 'Hello')).toBe(false)
  })
})

describe('calcStars', () => {
  it('maps score ratio to star count', () => {
    expect(calcStars(5, 5)).toBe(3)
    expect(calcStars(4, 5)).toBe(2)
    expect(calcStars(3, 5)).toBe(1)
    expect(calcStars(1, 5)).toBe(0)
  })
})

describe('calcXp', () => {
  it('adds performance and streak bonuses', () => {
    expect(calcXp(10, 5, 5, 0)).toBe(15)
    expect(calcXp(10, 5, 5, 3)).toBe(20)
  })
})

describe('levelFromXp / xpProgressInLevel', () => {
  it('computes level thresholds', () => {
    expect(levelFromXp(0)).toBe(1)
    expect(levelFromXp(100)).toBe(2)
    expect(levelFromXp(300)).toBe(3)

    const progress = xpProgressInLevel(150)
    expect(progress.level).toBe(2)
    expect(progress.current).toBe(50)
    expect(progress.needed).toBe(200)
  })
})

describe('buildQuestions', () => {
  it('builds one question per card with valid shape', () => {
    const questions = buildQuestions(sampleLesson)

    expect(questions).toHaveLength(sampleLesson.cards.length)
    for (const q of questions) {
      expect(q.prompt).toBeTruthy()
      expect(q.answer).toBeTruthy()
      expect(q.card).toBeDefined()
      if (q.type.startsWith('choice')) {
        expect(q.options).toContain(q.answer)
        expect(q.options?.length).toBeGreaterThan(1)
      }
    }
  })
})

describe('getQuestionLabel', () => {
  it('returns label for each question type', () => {
    expect(getQuestionLabel('choice-to-en')).toContain('inglês')
    expect(getQuestionLabel('reverse-type')).toContain('português')
  })
})
