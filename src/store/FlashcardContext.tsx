import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import {
  deckStorageKey,
  parseFlashcardDeck,
} from '../security/flashcardStorage'
import { readSecureStorage, writeSecureStorage } from '../security/storage'
import { sanitizeText, validateFlashcardField } from '../security/validation'
import type { DeckStatistics, FlashcardDeckState, UserFlashcard } from '../types/flashcard'
import {
  applyReview,
  computeStatistics,
  createNewCard,
  getDueCards,
  getEvolutionHistory,
  getToday,
} from '../utils/srs'
import { useAuth } from './AuthContext'

const defaultDeck: FlashcardDeckState = { cards: [], history: [] }

type Action =
  | { type: 'LOAD'; payload: FlashcardDeckState }
  | { type: 'RESET' }
  | { type: 'ADD_CARD'; payload: UserFlashcard }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'REVIEW'; payload: { cardId: string; correct: boolean } }

function updateHistory(
  history: FlashcardDeckState['history'],
  correct: boolean,
  today = getToday(),
): FlashcardDeckState['history'] {
  const existing = history.find((h) => h.date === today)
  if (existing) {
    return history.map((h) =>
      h.date === today
        ? { ...h, correct: h.correct + (correct ? 1 : 0), wrong: h.wrong + (correct ? 0 : 1) }
        : h,
    )
  }
  return [...history, { date: today, correct: correct ? 1 : 0, wrong: correct ? 0 : 1 }].slice(-90)
}

function reducer(state: FlashcardDeckState, action: Action): FlashcardDeckState {
  switch (action.type) {
    case 'LOAD':
      return action.payload
    case 'RESET':
      return defaultDeck
    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.payload] }
    case 'DELETE_CARD':
      return { ...state, cards: state.cards.filter((c) => c.id !== action.payload) }
    case 'REVIEW': {
      const { cardId, correct } = action.payload
      const today = getToday()
      const cards = state.cards.map((card) =>
        card.id === cardId ? applyReview(card, correct, today) : card,
      )
      return {
        cards,
        history: updateHistory(state.history, correct, today),
      }
    }
    default:
      return state
  }
}

interface FlashcardContextValue {
  cards: UserFlashcard[]
  dueCards: UserFlashcard[]
  stats: DeckStatistics
  evolution: { date: string; correct: number; wrong: number }[]
  addCard: (front: string, back: string, example?: string) => { ok: boolean; error?: string }
  deleteCard: (id: string) => void
  reviewCard: (id: string, correct: boolean) => void
}

const FlashcardContext = createContext<FlashcardContextValue | null>(null)

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const { session, isAuthenticated, can } = useAuth()
  const [state, dispatch] = useReducer(reducer, defaultDeck)

  useEffect(() => {
    if (!isAuthenticated || !session) {
      dispatch({ type: 'RESET' })
      return
    }
    const saved = readSecureStorage(deckStorageKey(session.username), parseFlashcardDeck)
    dispatch({ type: 'LOAD', payload: saved ?? defaultDeck })
  }, [isAuthenticated, session?.username])

  useEffect(() => {
    if (!isAuthenticated || !session || !can('game:save')) return
    writeSecureStorage(deckStorageKey(session.username), state)
  }, [state, isAuthenticated, session, can])

  const addCard = useCallback((front: string, back: string, example?: string) => {
    const frontCheck = validateFlashcardField(front, 'Frente')
    if (!frontCheck.valid || !frontCheck.sanitized) {
      return { ok: false, error: frontCheck.error }
    }
    const backCheck = validateFlashcardField(back, 'Verso')
    if (!backCheck.valid || !backCheck.sanitized) {
      return { ok: false, error: backCheck.error }
    }
    const exampleSanitized = example ? sanitizeText(example, 200) : undefined

    const card = createNewCard(frontCheck.sanitized, backCheck.sanitized, exampleSanitized)
    dispatch({ type: 'ADD_CARD', payload: card })
    return { ok: true }
  }, [])

  const deleteCard = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CARD', payload: id })
  }, [])

  const reviewCard = useCallback((id: string, correct: boolean) => {
    dispatch({ type: 'REVIEW', payload: { cardId: id, correct } })
  }, [])

  const dueCards = useMemo(() => getDueCards(state.cards), [state.cards])
  const stats = useMemo(() => computeStatistics(state.cards, state.history), [state.cards, state.history])
  const evolution = useMemo(() => getEvolutionHistory(state.history), [state.history])

  const value = useMemo<FlashcardContextValue>(
    () => ({
      cards: state.cards,
      dueCards,
      stats,
      evolution,
      addCard,
      deleteCard,
      reviewCard,
    }),
    [state.cards, dueCards, stats, evolution, addCard, deleteCard, reviewCard],
  )

  return <FlashcardContext.Provider value={value}>{children}</FlashcardContext.Provider>
}

export function useFlashcards() {
  const ctx = useContext(FlashcardContext)
  if (!ctx) throw new Error('useFlashcards must be used within FlashcardProvider')
  return ctx
}
