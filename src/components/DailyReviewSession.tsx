import { useCallback, useState } from 'react'
import { useFlashcards } from '../store/FlashcardContext'
import { addDays, getNextIntervalDays } from '../utils/srs'
import type { UserFlashcard } from '../types/flashcard'

type Phase = 'question' | 'answer' | 'done'

function formatNextReview(card: UserFlashcard, correct: boolean): string {
  const streak = correct ? card.correctStreak + 1 : 0
  const days = getNextIntervalDays(streak, correct)
  return addDays(new Date().toISOString().slice(0, 10), days)
}

export function DailyReviewSession() {
  const { dueCards, reviewCard, stats } = useFlashcards()
  const [queue, setQueue] = useState<UserFlashcard[]>(() => [...dueCards])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>(() => (dueCards.length > 0 ? 'question' : 'done'))
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 })
  const [lastFeedback, setLastFeedback] = useState<{ correct: boolean; nextDate: string } | null>(
    null,
  )

  const current = queue[index]
  const total = queue.length

  const syncQueue = useCallback(() => {
    setQueue([...dueCards])
    setIndex(0)
    setPhase(dueCards.length > 0 ? 'question' : 'done')
    setSessionStats({ correct: 0, wrong: 0 })
    setLastFeedback(null)
  }, [dueCards])

  const handleReveal = () => setPhase('answer')

  const handleReview = useCallback(
    (correct: boolean) => {
      if (!current) return

      reviewCard(current.id, correct)
      setSessionStats((s) => ({
        correct: s.correct + (correct ? 1 : 0),
        wrong: s.wrong + (correct ? 0 : 1),
      }))
      setLastFeedback({
        correct,
        nextDate: formatNextReview(current, correct),
      })

      if (index + 1 >= total) {
        setPhase('done')
      } else {
        setIndex((i) => i + 1)
        setPhase('question')
      }
    },
    [current, index, total, reviewCard],
  )

  const progress = total > 0 ? ((index + (phase === 'answer' ? 0.5 : 0)) / total) * 100 : 100

  if (queue.length === 0 && phase === 'done') {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-10 text-center animate-bounce-in">
        <span className="text-6xl">✅</span>
        <h2 className="mt-4 text-xl font-black text-white">Nada para revisar hoje!</h2>
        <p className="mt-2 text-sm text-white/70">
          {stats.totalCards === 0
            ? 'Crie flashcards na aba "Criar" para começar.'
            : 'Todos os cards agendados já foram revisados. Volte amanhã!'}
        </p>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-10 text-center animate-bounce-in">
        <span className="text-6xl">🎉</span>
        <h2 className="mt-4 text-xl font-black text-white">Sessão concluída!</h2>
        <div className="duo-card mx-auto mt-6 max-w-xs p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-black text-duo-green">{sessionStats.correct}</p>
              <p className="text-xs font-bold text-duo-gray">Acertos</p>
            </div>
            <div>
              <p className="text-3xl font-black text-duo-red">{sessionStats.wrong}</p>
              <p className="text-xs font-bold text-duo-gray">Erros</p>
            </div>
          </div>
        </div>
        {dueCards.length > 0 && (
          <button type="button" onClick={syncQueue} className="duo-btn duo-btn-blue mt-6">
            Revisar novamente ({dueCards.length})
          </button>
        )}
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-white">Revisão diária</h2>
        <span className="text-sm font-bold text-white/70">
          {index + 1}/{total} pendentes
        </span>
      </div>

      <div className="mb-6 h-3 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-duo-green transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="duo-card min-h-[280px] p-6 animate-bounce-in">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-duo-blue">Frente</p>
        <p className="text-3xl font-black text-duo-text">{current.front}</p>

        {phase === 'answer' && (
          <div className="mt-6 border-t-2 border-gray-100 pt-6 animate-bounce-in">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-duo-green">Verso</p>
            <p className="text-2xl font-bold text-duo-text">{current.back}</p>
            {current.example && (
              <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm italic text-duo-blue-dark">
                {current.example}
              </p>
            )}
          </div>
        )}

        {lastFeedback && phase === 'question' && index > 0 && (
          <p className="mt-4 text-xs text-duo-gray">
            Anterior: {lastFeedback.correct ? '✓' : '✗'} — próxima revisão em{' '}
            {lastFeedback.nextDate}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {phase === 'question' ? (
          <button type="button" onClick={handleReveal} className="duo-btn duo-btn-blue w-full">
            Mostrar resposta
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleReview(false)}
              className="duo-btn duo-btn-red w-full"
            >
              Errei
            </button>
            <button
              type="button"
              onClick={() => handleReview(true)}
              className="duo-btn duo-btn-green w-full"
            >
              Acertei
            </button>
          </>
        )}
      </div>
    </div>
  )
}
