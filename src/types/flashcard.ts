export interface UserFlashcard {
  id: string
  front: string
  back: string
  example?: string
  createdAt: string
  correctStreak: number
  nextReviewDate: string
  totalCorrect: number
  totalWrong: number
  lastReviewedAt: string | null
}

export interface DailyHistoryEntry {
  date: string
  correct: number
  wrong: number
}

export interface FlashcardDeckState {
  cards: UserFlashcard[]
  history: DailyHistoryEntry[]
}

export interface DeckStatistics {
  totalCorrect: number
  totalWrong: number
  pendingToday: number
  totalCards: number
  reviewedToday: number
}

export type MainTab = 'path' | 'review' | 'create' | 'stats'
