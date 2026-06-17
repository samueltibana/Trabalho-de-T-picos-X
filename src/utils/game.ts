import type { Lesson, Question, QuestionType } from '../types'
import { getAllCards, getDistractors } from '../data/lessons'

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickQuestionType(types: QuestionType[], difficulty: number, index: number): QuestionType {
  const type = types[index % types.length]
  if (difficulty >= 3 && index % 2 === 1) {
    return types.includes('type-answer') ? 'type-answer' : type
  }
  if (difficulty >= 4 && types.includes('reverse-type')) {
    return index % 3 === 0 ? 'reverse-type' : type
  }
  return type
}

export function buildQuestions(lesson: Lesson): Question[] {
  const allEn = getAllCards().map((c) => c.en)
  const allPt = getAllCards().map((c) => c.pt)
  const cards = shuffle(lesson.cards)

  return cards.map((card, index) => {
    const type = pickQuestionType(lesson.questionTypes, lesson.difficulty, index)

    switch (type) {
      case 'choice-to-en': {
        const options = shuffle([card.en, ...getDistractors(card.en, allEn)])
        return {
          card,
          type,
          prompt: card.pt,
          answer: card.en,
          options,
        }
      }
      case 'choice-to-pt': {
        const options = shuffle([card.pt, ...getDistractors(card.pt, allPt)])
        return {
          card,
          type,
          prompt: card.en,
          answer: card.pt,
          options,
        }
      }
      case 'reverse-type':
        return {
          card,
          type,
          prompt: card.en,
          answer: card.pt,
        }
      case 'type-answer':
      default:
        return {
          card,
          type: 'type-answer',
          prompt: card.pt,
          answer: card.en,
        }
    }
  })
}

export function normalizeAnswer(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[?!.,]/g, '')
    .slice(0, 120)
}

export function checkAnswer(userAnswer: string, correct: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correct)
}

export function calcStars(score: number, total: number): number {
  const ratio = score / total
  if (ratio >= 1) return 3
  if (ratio >= 0.7) return 2
  if (ratio >= 0.5) return 1
  return 0
}

export function calcXp(baseXp: number, score: number, total: number, streak: number): number {
  const ratio = score / total
  const bonus = Math.floor(ratio * baseXp * 0.5)
  const streakBonus = streak >= 3 ? 5 : 0
  return baseXp + bonus + streakBonus
}

export function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function xpForLevel(level: number): number {
  return level * 100
}

export function levelFromXp(xp: number): number {
  let level = 1
  let needed = 100
  let remaining = xp
  while (remaining >= needed) {
    remaining -= needed
    level++
    needed = level * 100
  }
  return level
}

export function xpProgressInLevel(xp: number): { current: number; needed: number; level: number } {
  const level = levelFromXp(xp)
  let spent = 0
  for (let l = 1; l < level; l++) {
    spent += l * 100
  }
  const current = xp - spent
  const needed = level * 100
  return { current, needed, level }
}

export function getQuestionLabel(type: QuestionType): string {
  switch (type) {
    case 'choice-to-en':
      return 'Traduza para inglês'
    case 'choice-to-pt':
      return 'Traduza para português'
    case 'type-answer':
      return 'Digite a tradução em inglês'
    case 'reverse-type':
      return 'Digite a tradução em português'
  }
}
