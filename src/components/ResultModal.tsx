import type { Lesson, LessonResult } from '../types'

interface ResultModalProps {
  lesson: Lesson
  result: LessonResult
  onContinue: () => void
}

export function ResultModal({ lesson, result, onContinue }: ResultModalProps) {
  const pct = Math.round((result.score / result.total) * 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="animate-bounce-in w-full max-w-md rounded-3xl bg-white p-8 text-center">
        <span className="text-6xl">{result.perfect ? '🏆' : result.stars >= 2 ? '🎉' : '💪'}</span>

        <h2 className="mt-4 text-2xl font-black text-duo-text">
          {result.perfect ? 'Perfeito!' : result.stars >= 2 ? 'Muito bem!' : 'Continue praticando!'}
        </h2>

        <p className="mt-1 text-sm text-duo-gray">{lesson.title}</p>

        <div className="mt-6 flex justify-center gap-1 text-3xl">
          {[1, 2, 3].map((star) => (
            <span key={star} className={star <= result.stars ? 'text-duo-yellow' : 'text-gray-300'}>
              ★
            </span>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-green-50 p-3">
            <p className="text-2xl font-black text-duo-green">{result.score}/{result.total}</p>
            <p className="text-xs font-bold text-duo-gray">Acertos</p>
          </div>
          <div className="rounded-2xl bg-yellow-50 p-3">
            <p className="text-2xl font-black text-duo-orange">{pct}%</p>
            <p className="text-xs font-bold text-duo-gray">Precisão</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-blue-50 p-4 animate-pop">
          <p className="text-sm font-bold text-duo-blue-dark">XP ganho</p>
          <p className="text-3xl font-black text-duo-blue">+{result.xpEarned}</p>
        </div>

        <button type="button" onClick={onContinue} className="duo-btn duo-btn-green mt-6 w-full">
          Continuar
        </button>
      </div>
    </div>
  )
}
