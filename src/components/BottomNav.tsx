import type { MainTab } from '../types/flashcard'

interface BottomNavProps {
  active: MainTab
  onChange: (tab: MainTab) => void
  pendingCount?: number
}

const tabs: { id: MainTab; label: string; icon: string }[] = [
  { id: 'path', label: 'Caminho', icon: '🗺️' },
  { id: 'review', label: 'Revisão', icon: '🔄' },
  { id: 'create', label: 'Criar', icon: '➕' },
  { id: 'stats', label: 'Stats', icon: '📊' },
]

export function BottomNav({ active, onChange, pendingCount = 0 }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#1a4278]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-bold transition ${
              active === tab.id ? 'text-duo-green-light' : 'text-white/60 hover:text-white'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            {tab.label}
            {tab.id === 'review' && pendingCount > 0 && (
              <span className="absolute right-1/4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-duo-red px-1 text-[10px] text-white">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
