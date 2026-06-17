import { useGame } from '../store/GameContext'

interface NoHeartsScreenProps {
  onRefill: () => void
  onBack: () => void
}

export function NoHeartsScreen({ onRefill, onBack }: NoHeartsScreenProps) {
  const { state } = useGame()

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center animate-bounce-in">
      <span className="text-7xl">💔</span>
      <h2 className="mt-4 text-2xl font-black text-white">Sem vidas!</h2>
      <p className="mt-2 text-white/70">
        Você perdeu todas as suas {state.maxHearts} vidas. Recarregue para continuar
        aprendendo.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3">
        <button type="button" onClick={onRefill} className="duo-btn duo-btn-green w-full">
          Recarregar vidas
        </button>
        <button type="button" onClick={onBack} className="duo-btn duo-btn-gray w-full">
          Voltar ao caminho
        </button>
      </div>
    </div>
  )
}
