import { missions } from '../data/missions'
import { useGame } from '../store/GameContext'

interface MissionsPanelProps {
  open: boolean
  onClose: () => void
}

export function MissionsPanel({ open, onClose }: MissionsPanelProps) {
  const { getMissionProgress, isMissionComplete, state } = useGame()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="animate-bounce-in w-full max-w-lg rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-duo-text">Missões diárias</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-duo-gray hover:bg-gray-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 rounded-2xl bg-blue-50 p-3 text-sm text-duo-blue-dark">
          <span className="font-bold">Sequência: {state.streak} dias</span>
          <span className="mx-2">·</span>
          <span>{state.dailyStats.lessonsCompleted} lições hoje</span>
        </div>

        <div className="flex flex-col gap-3">
          {missions.map((mission) => {
            const progress = getMissionProgress(mission.id)
            const complete = isMissionComplete(mission.id)
            const pct = Math.min(100, (progress / mission.target) * 100)

            return (
              <div
                key={mission.id}
                className={`rounded-2xl border-2 p-4 transition ${
                  complete
                    ? 'border-duo-green bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{mission.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-duo-text">{mission.title}</h3>
                      {complete && (
                        <span className="rounded-full bg-duo-green px-2 py-0.5 text-xs font-bold text-white">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-duo-gray">{mission.description}</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all ${
                          complete ? 'bg-duo-green' : 'bg-duo-blue'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-xs font-bold">
                      <span className="text-duo-gray">
                        {Math.min(progress, mission.target)}/{mission.target}
                      </span>
                      <span className="text-duo-yellow">+{mission.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button type="button" onClick={onClose} className="duo-btn duo-btn-green mt-6 w-full">
          Continuar
        </button>
      </div>
    </div>
  )
}
