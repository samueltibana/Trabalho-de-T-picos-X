import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { missions } from '../data/missions'
import { getAllLessons, getLessonById, getLessonIndex } from '../data/lessons'
import { getToday, levelFromXp } from '../utils/game'
import { secureLog } from '../security/logger'
import {
  gameStorageKey,
  parseGameState,
  readSecureStorage,
  writeSecureStorage,
} from '../security/storage'
import { clampNumber, validateLessonId } from '../security/validation'
import { useAuth } from './AuthContext'
import type { GameState, LessonProgress, LessonResult } from '../types'

const defaultState: GameState = {
  hearts: 5,
  maxHearts: 5,
  xp: 0,
  streak: 0,
  level: 1,
  completedLessons: {},
  dailyStats: {
    date: getToday(),
    lessonsCompleted: 0,
    correctAnswers: 0,
    xpEarned: 0,
  },
  missionProgress: {},
  lastPlayedDate: null,
}

type Action =
  | { type: 'LOAD'; payload: GameState }
  | { type: 'RESET' }
  | { type: 'LOSE_HEART' }
  | { type: 'REFILL_HEARTS' }
  | { type: 'COMPLETE_LESSON'; payload: { lessonId: string; result: LessonResult } }
  | { type: 'RECORD_CORRECT' }
  | { type: 'UPDATE_STREAK' }

function resetDailyIfNeeded(state: GameState): GameState {
  const today = getToday()
  if (state.dailyStats.date === today) return state
  return {
    ...state,
    dailyStats: {
      date: today,
      lessonsCompleted: 0,
      correctAnswers: 0,
      xpEarned: 0,
    },
    missionProgress: {},
  }
}

function updateStreak(state: GameState): GameState {
  const today = getToday()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  let streak = state.streak
  if (state.lastPlayedDate === today) {
    /* same day */
  } else if (state.lastPlayedDate === yesterdayStr) {
    streak += 1
  } else if (state.lastPlayedDate === null) {
    streak = 1
  } else {
    streak = 1
  }

  return { ...state, streak, lastPlayedDate: today }
}

function validateLessonResult(result: LessonResult, totalCards: number): LessonResult | null {
  const total = clampNumber(totalCards, 1, 50, 1)
  const score = clampNumber(result.score, 0, total, 0)
  const stars = clampNumber(result.stars, 0, 3, 0)
  const xpEarned = clampNumber(result.xpEarned, 0, 500, 0)

  if (score > total) return null

  return {
    score,
    total,
    stars,
    xpEarned,
    perfect: score === total,
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD':
      return resetDailyIfNeeded(action.payload)

    case 'RESET':
      return defaultState

    case 'LOSE_HEART':
      return { ...state, hearts: Math.max(0, state.hearts - 1) }

    case 'REFILL_HEARTS':
      return { ...state, hearts: state.maxHearts }

    case 'RECORD_CORRECT': {
      const s = resetDailyIfNeeded(state)
      return {
        ...s,
        dailyStats: {
          ...s.dailyStats,
          correctAnswers: s.dailyStats.correctAnswers + 1,
        },
        missionProgress: {
          ...s.missionProgress,
          'mission-correct': (s.missionProgress['mission-correct'] ?? 0) + 1,
        },
      }
    }

    case 'UPDATE_STREAK':
      return updateStreak(resetDailyIfNeeded(state))

    case 'COMPLETE_LESSON': {
      const { lessonId, result } = action.payload

      if (!validateLessonId(lessonId)) return state

      const lesson = getLessonById(lessonId)
      if (!lesson) return state

      const safeResult = validateLessonResult(result, lesson.cards.length)
      if (!safeResult) {
        secureLog.warn('Resultado de lição inválido rejeitado', { lessonId })
        return state
      }

      let s = updateStreak(resetDailyIfNeeded(state))

      const prev: LessonProgress = s.completedLessons[lessonId] ?? {
        completed: false,
        stars: 0,
        bestScore: 0,
      }

      const progress: LessonProgress = {
        completed: true,
        stars: Math.max(prev.stars, safeResult.stars),
        bestScore: Math.max(prev.bestScore, safeResult.score),
      }

      s = {
        ...s,
        xp: s.xp + safeResult.xpEarned,
        level: levelFromXp(s.xp + safeResult.xpEarned),
        completedLessons: { ...s.completedLessons, [lessonId]: progress },
        dailyStats: {
          ...s.dailyStats,
          lessonsCompleted: s.dailyStats.lessonsCompleted + 1,
          xpEarned: s.dailyStats.xpEarned + safeResult.xpEarned,
        },
        missionProgress: {
          ...s.missionProgress,
          'mission-lessons': (s.missionProgress['mission-lessons'] ?? 0) + 1,
          'mission-xp': (s.missionProgress['mission-xp'] ?? 0) + safeResult.xpEarned,
          'mission-streak': s.streak,
        },
      }

      return s
    }

    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  loseHeart: () => void
  refillHearts: () => boolean
  recordCorrect: () => void
  completeLesson: (lessonId: string, result: LessonResult) => void
  updateStreak: () => void
  isLessonUnlocked: (lessonId: string) => boolean
  isLessonCompleted: (lessonId: string) => boolean
  getMissionProgress: (missionId: string) => number
  isMissionComplete: (missionId: string) => boolean
  claimableMissions: number
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const { session, can, isAuthenticated } = useAuth()
  const [state, dispatch] = useReducer(reducer, defaultState)

  useEffect(() => {
    if (!isAuthenticated || !session) {
      dispatch({ type: 'RESET' })
      return
    }

    const key = gameStorageKey(session.username)
    const saved = readSecureStorage(key, parseGameState)
    if (saved) {
      dispatch({ type: 'LOAD', payload: saved })
    } else {
      dispatch({ type: 'RESET' })
    }
  }, [isAuthenticated, session?.username])

  useEffect(() => {
    if (!isAuthenticated || !session || !can('game:save')) return
    writeSecureStorage(gameStorageKey(session.username), state)
  }, [state, isAuthenticated, session, can])

  const isLessonUnlocked = useCallback(
    (lessonId: string) => {
      if (!validateLessonId(lessonId)) return false
      const index = getLessonIndex(lessonId)
      if (index <= 0) return true
      const lessons = getAllLessons()
      const prev = lessons[index - 1]
      return state.completedLessons[prev.id]?.completed ?? false
    },
    [state.completedLessons],
  )

  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      if (!validateLessonId(lessonId)) return false
      return state.completedLessons[lessonId]?.completed ?? false
    },
    [state.completedLessons],
  )

  const getMissionProgress = useCallback(
    (missionId: string) => {
      const mission = missions.find((m) => m.id === missionId)
      if (!mission) return 0
      if (mission.metric === 'streak') return state.streak
      return state.missionProgress[missionId] ?? 0
    },
    [state.missionProgress, state.streak],
  )

  const isMissionComplete = useCallback(
    (missionId: string) => {
      const mission = missions.find((m) => m.id === missionId)
      if (!mission) return false
      return getMissionProgress(missionId) >= mission.target
    },
    [getMissionProgress],
  )

  const claimableMissions = useMemo(
    () => missions.filter((m) => isMissionComplete(m.id)).length,
    [isMissionComplete],
  )

  const refillHearts = useCallback(() => {
    if (!can('game:refill-hearts')) {
      secureLog.warn('Recarga de vidas negada — sem permissão')
      return false
    }
    dispatch({ type: 'REFILL_HEARTS' })
    return true
  }, [can])

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      loseHeart: () => dispatch({ type: 'LOSE_HEART' }),
      refillHearts,
      recordCorrect: () => {
        if (!can('game:play')) return
        dispatch({ type: 'RECORD_CORRECT' })
      },
      completeLesson: (lessonId, result) => {
        if (!can('game:play')) return
        dispatch({ type: 'COMPLETE_LESSON', payload: { lessonId, result } })
      },
      updateStreak: () => dispatch({ type: 'UPDATE_STREAK' }),
      isLessonUnlocked,
      isLessonCompleted,
      getMissionProgress,
      isMissionComplete,
      claimableMissions,
    }),
    [
      state,
      refillHearts,
      can,
      isLessonUnlocked,
      isLessonCompleted,
      getMissionProgress,
      isMissionComplete,
      claimableMissions,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
