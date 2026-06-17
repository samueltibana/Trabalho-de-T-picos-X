export type Difficulty = 1 | 2 | 3 | 4

export type QuestionType = 'choice-to-en' | 'choice-to-pt' | 'type-answer' | 'reverse-type'

export interface Flashcard {
  id: string
  pt: string
  en: string
  hint?: string
}

export interface Lesson {
  id: string
  unitId: string
  title: string
  description: string
  difficulty: Difficulty
  xpReward: number
  cards: Flashcard[]
  questionTypes: QuestionType[]
}

export interface Unit {
  id: string
  title: string
  subtitle: string
  color: string
  icon: string
  lessons: Lesson[]
}

export interface Mission {
  id: string
  title: string
  description: string
  icon: string
  target: number
  xpReward: number
  metric: 'lessons' | 'correct' | 'xp' | 'streak'
}

export interface LessonProgress {
  completed: boolean
  stars: number
  bestScore: number
}

export interface GameState {
  hearts: number
  maxHearts: number
  xp: number
  streak: number
  level: number
  completedLessons: Record<string, LessonProgress>
  dailyStats: {
    date: string
    lessonsCompleted: number
    correctAnswers: number
    xpEarned: number
  }
  missionProgress: Record<string, number>
  lastPlayedDate: string | null
}

export interface Question {
  card: Flashcard
  type: QuestionType
  prompt: string
  answer: string
  options?: string[]
}

export type AppScreen = 'path' | 'lesson' | 'missions' | 'no-hearts'

export interface LessonResult {
  score: number
  total: number
  xpEarned: number
  stars: number
  perfect: boolean
}
