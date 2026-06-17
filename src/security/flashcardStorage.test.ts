import { describe, expect, it } from 'vitest'
import { deckStorageKey, parseFlashcardDeck } from './flashcardStorage'
import { createNewCard } from '../utils/srs'

describe('deckStorageKey', () => {
  it('namespaces deck by lowercase username', () => {
    expect(deckStorageKey('Joao')).toBe('linguapath-deck:joao')
  })
})

describe('parseFlashcardDeck', () => {
  it('parses valid deck state', () => {
    const card = createNewCard('Olá', 'Hello', 'Hi')
    const parsed = parseFlashcardDeck({
      cards: [card],
      history: [{ date: '2026-06-16', correct: 2, wrong: 1 }],
    })

    expect(parsed?.cards).toHaveLength(1)
    expect(parsed?.cards[0].front).toBe('Olá')
    expect(parsed?.history[0].correct).toBe(2)
  })

  it('rejects cards without front/back or invalid ids', () => {
    const parsed = parseFlashcardDeck({
      cards: [
        { id: 'x', front: '', back: 'Hello' },
        { id: 'y', front: 'Olá', back: 'Hello' },
        null,
      ],
      history: [],
    })

    expect(parsed?.cards).toHaveLength(1)
    expect(parsed?.cards[0].front).toBe('Olá')
  })

  it('sanitizes malicious text and clamps numeric fields', () => {
    const parsed = parseFlashcardDeck({
      cards: [
        {
          id: 'card-1',
          front: 'Olá<script>',
          back: 'Hello',
          correctStreak: 999,
          totalCorrect: -5,
          nextReviewDate: 'invalid',
          createdAt: '2026-06-16',
        },
      ],
      history: [{ date: 'bad-date', correct: 1, wrong: 0 }],
    })

    expect(parsed?.cards[0].front).toBe('Oláscript')
    expect(parsed?.cards[0].correctStreak).toBe(20)
    expect(parsed?.cards[0].totalCorrect).toBe(0)
    expect(parsed?.history).toHaveLength(0)
  })

  it('returns null for non-object input', () => {
    expect(parseFlashcardDeck(null)).toBeNull()
    expect(parseFlashcardDeck('string')).toBeNull()
  })
})
