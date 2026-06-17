import { units, getAllLessons } from '../data/lessons'
import { useGame } from '../store/GameContext'
import { LevelNode } from './LevelNode'

interface PathBoardProps {
  onSelectLesson: (lessonId: string) => void
}

function getSide(index: number): 'left' | 'center' | 'right' {
  const pattern = index % 3
  if (pattern === 0) return 'center'
  if (pattern === 1) return 'right'
  return 'left'
}

export function PathBoard({ onSelectLesson }: PathBoardProps) {
  const { isLessonUnlocked, isLessonCompleted } = useGame()
  const allLessons = getAllLessons()

  const currentLessonId = allLessons.find(
    (l) => isLessonUnlocked(l.id) && !isLessonCompleted(l.id),
  )?.id

  let globalIndex = 0

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <div className="mb-8 text-center animate-bounce-in">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-duo-green text-4xl shadow-[0_6px_0_#46a302]">
          🦉
        </div>
        <h1 className="text-2xl font-black text-white">LinguaPath</h1>
        <p className="mt-1 text-sm text-white/70">Português → Inglês</p>
      </div>

      {units.map((unit) => (
        <section key={unit.id} className="mb-10">
          <div
            className="mb-6 rounded-2xl p-4 shadow-lg"
            style={{ backgroundColor: unit.color }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{unit.icon}</span>
              <div>
                <h2 className="text-lg font-extrabold text-white">{unit.title}</h2>
                <p className="text-sm text-white/80">{unit.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col gap-6">
            {unit.lessons.map((lesson) => {
              const side = getSide(globalIndex)
              const node = (
                <LevelNode
                  key={lesson.id}
                  lesson={lesson}
                  index={globalIndex}
                  side={side}
                  isCurrent={lesson.id === currentLessonId}
                  onSelect={onSelectLesson}
                />
              )
              globalIndex++
              return node
            })}
          </div>
        </section>
      ))}

      {allLessons.every((l) => isLessonCompleted(l.id)) && (
        <div className="duo-card animate-bounce-in p-6 text-center">
          <span className="text-5xl">🏆</span>
          <h3 className="mt-3 text-xl font-extrabold text-duo-green">Parabéns!</h3>
          <p className="mt-1 text-sm text-duo-text">
            Você completou todo o caminho. Continue praticando para manter sua sequência!
          </p>
        </div>
      )}
    </div>
  )
}
