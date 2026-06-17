import { useCallback, useState } from 'react'
import { getLessonById } from './data/lessons'
import { AuthProvider, useAuth } from './store/AuthContext'
import { GameProvider, useGame } from './store/GameContext'
import { FlashcardProvider, useFlashcards } from './store/FlashcardContext'
import { AuthScreen } from './components/AuthScreen'
import { Header } from './components/Header'
import { PathBoard } from './components/PathBoard'
import { FlashcardLesson } from './components/FlashcardLesson'
import { MissionsPanel } from './components/MissionsPanel'
import { NoHeartsScreen } from './components/NoHeartsScreen'
import { ResultModal } from './components/ResultModal'
import { BottomNav } from './components/BottomNav'
import { DailyReviewSession } from './components/DailyReviewSession'
import { CreateFlashcardForm } from './components/CreateFlashcardForm'
import { StatisticsPanel } from './components/StatisticsPanel'
import { validateLessonId } from './security/validation'
import type { MainTab } from './types/flashcard'
import type { AppScreen, LessonResult } from './types'

function AppContent() {
  const { can } = useAuth()
  const { state, completeLesson, refillHearts, claimableMissions, isLessonUnlocked } = useGame()
  const { stats: deckStats } = useFlashcards()

  const [mainTab, setMainTab] = useState<MainTab>('review')
  const [reviewKey, setReviewKey] = useState(0)
  const [screen, setScreen] = useState<AppScreen>('path')
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [missionsOpen, setMissionsOpen] = useState(false)
  const [lessonResult, setLessonResult] = useState<LessonResult | null>(null)

  const activeLesson = activeLessonId ? getLessonById(activeLessonId) : undefined
  const inLessonFlow = screen === 'lesson' || screen === 'no-hearts' || lessonResult !== null

  const handleTabChange = useCallback((tab: MainTab) => {
    if (tab === 'review') setReviewKey((k) => k + 1)
    setMainTab(tab)
    if (tab === 'path') setScreen('path')
  }, [])

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      if (!can('game:play')) return
      if (!validateLessonId(lessonId)) return
      if (!isLessonUnlocked(lessonId)) return
      if (state.hearts <= 0) {
        setScreen('no-hearts')
        return
      }
      setActiveLessonId(lessonId)
      setScreen('lesson')
      setLessonResult(null)
    },
    [can, isLessonUnlocked, state.hearts],
  )

  const handleLessonComplete = useCallback(
    (result: LessonResult) => {
      if (activeLessonId && can('game:play')) {
        completeLesson(activeLessonId, result)
        setLessonResult(result)
      }
    },
    [activeLessonId, completeLesson, can],
  )

  const handleResultContinue = useCallback(() => {
    setLessonResult(null)
    setActiveLessonId(null)
    setScreen(state.hearts <= 0 ? 'no-hearts' : 'path')
  }, [state.hearts])

  const handleQuitLesson = useCallback(() => {
    setActiveLessonId(null)
    setScreen(state.hearts <= 0 ? 'no-hearts' : 'path')
  }, [state.hearts])

  const handleRefill = useCallback(() => {
    if (refillHearts()) setScreen('path')
  }, [refillHearts])

  return (
    <div className="min-h-dvh">
      <Header
        onMissionsClick={() => setMissionsOpen(true)}
        missionBadge={claimableMissions}
      />

      {!inLessonFlow && mainTab === 'path' && screen === 'path' && (
        <PathBoard onSelectLesson={handleSelectLesson} />
      )}

      {!inLessonFlow && mainTab === 'review' && (
        <DailyReviewSession key={reviewKey} />
      )}

      {!inLessonFlow && mainTab === 'create' && <CreateFlashcardForm />}

      {!inLessonFlow && mainTab === 'stats' && <StatisticsPanel />}

      {screen === 'lesson' && activeLesson && !lessonResult && (
        <FlashcardLesson
          lesson={activeLesson}
          onComplete={handleLessonComplete}
          onQuit={handleQuitLesson}
          onOutOfHearts={() => setScreen('no-hearts')}
        />
      )}

      {screen === 'no-hearts' && (
        <NoHeartsScreen onRefill={handleRefill} onBack={() => setScreen('path')} />
      )}

      {lessonResult && activeLesson && (
        <ResultModal
          lesson={activeLesson}
          result={lessonResult}
          onContinue={handleResultContinue}
        />
      )}

      <MissionsPanel open={missionsOpen} onClose={() => setMissionsOpen(false)} />

      {!inLessonFlow && (
        <BottomNav
          active={mainTab}
          onChange={handleTabChange}
          pendingCount={deckStats.pendingToday}
        />
      )}
    </div>
  )
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="font-bold text-white">Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return (
    <FlashcardProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </FlashcardProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}
