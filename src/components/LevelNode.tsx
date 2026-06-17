import type { Lesson } from '../types'
import { useGame } from '../store/GameContext'

interface LevelNodeProps {
  lesson: Lesson
  index: number
  side: 'left' | 'center' | 'right'
  isCurrent: boolean
  onSelect: (lessonId: string) => void
}

const difficultyLabels = ['', 'Fácil', 'Médio', 'Difícil', 'Expert']

export function LevelNode({ lesson, index, side, isCurrent, onSelect }: LevelNodeProps) {
  const { isLessonUnlocked, isLessonCompleted, state } = useGame()
  const unlocked = isLessonUnlocked(lesson.id)
  const completed = isLessonCompleted(lesson.id)
  const progress = state.completedLessons[lesson.id]
  const locked = !unlocked

  const alignClass =
    side === 'left' ? 'self-start ml-8' : side === 'right' ? 'self-end mr-8' : 'self-center'

  return (
    <div className={`flex flex-col items-center ${alignClass}`}>
      <button
        type="button"
        disabled={locked}
        onClick={() => onSelect(lesson.id)}
        className={`group relative flex h-16 w-16 items-center justify-center rounded-full border-4 font-extrabold transition-all ${
          locked
            ? 'cursor-not-allowed border-gray-400/50 bg-gray-500/30 text-gray-400'
            : completed
              ? 'border-duo-yellow bg-duo-green text-white shadow-[0_4px_0_#46a302] hover:brightness-110'
              : isCurrent
                ? 'animate-float border-white bg-duo-green text-white shadow-[0_4px_0_#46a302] ring-4 ring-white/30'
                : 'border-duo-green-dark bg-duo-green text-white shadow-[0_4px_0_#46a302] hover:brightness-110 active:translate-y-0.5 active:shadow-[0_2px_0_#46a302]'
        }`}
        aria-label={lesson.title}
      >
        {locked ? (
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
        ) : completed ? (
          <span className="text-2xl">★</span>
        ) : (
          <span>{index + 1}</span>
        )}

        {isCurrent && !completed && !locked && (
          <span className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-white" />
        )}
      </button>

      <div className="mt-2 max-w-[120px] text-center">
        <p className={`text-xs font-bold ${locked ? 'text-white/40' : 'text-white'}`}>
          {lesson.title}
        </p>
        {!locked && (
          <p className="text-[10px] text-white/60">
            {difficultyLabels[lesson.difficulty]} · {lesson.xpReward} XP
          </p>
        )}
        {progress && progress.stars > 0 && (
          <p className="text-[10px] text-duo-yellow">
            {'★'.repeat(progress.stars)}
            {'☆'.repeat(3 - progress.stars)}
          </p>
        )}
      </div>
    </div>
  )
}
