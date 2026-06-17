import { xpProgressInLevel } from '../utils/game'
import { useGame } from '../store/GameContext'
import { useAuth } from '../store/AuthContext'

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 ${filled ? 'text-duo-red' : 'text-duo-gray/40'}`}
      fill="currentColor"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

interface HeaderProps {
  onMissionsClick: () => void
  missionBadge?: number
}

export function Header({ onMissionsClick, missionBadge = 0 }: HeaderProps) {
  const { state } = useGame()
  const { session, logout } = useAuth()
  const xpInfo = xpProgressInLevel(state.xp)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#235390]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: state.maxHearts }).map((_, i) => (
              <HeartIcon key={i} filled={i < state.hearts} />
            ))}
          </div>
          {session && (
            <span className="hidden text-xs font-bold text-white/70 sm:inline">
              {session.username}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-black/20 px-3 py-1">
            <span className="text-lg">🔥</span>
            <span className="font-extrabold text-white">{state.streak}</span>
          </div>

          <div className="flex min-w-[80px] flex-col items-end">
            <div className="flex items-center gap-1">
              <span className="text-sm font-extrabold text-duo-yellow">⚡ {state.xp}</span>
            </div>
            <div className="mt-0.5 h-1.5 w-20 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-duo-yellow transition-all"
                style={{ width: `${(xpInfo.current / xpInfo.needed) * 100}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onMissionsClick}
            className="relative rounded-xl bg-duo-yellow/20 p-2 transition hover:bg-duo-yellow/30"
            aria-label="Missões"
          >
            <span className="text-xl">🎯</span>
            {missionBadge > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-duo-red text-xs font-bold text-white">
                {missionBadge}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl bg-white/10 px-2 py-1 text-xs font-bold text-white hover:bg-white/20"
            aria-label="Sair"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
