import { useState } from 'react'
import { useFlashcards } from '../store/FlashcardContext'
import { getNextIntervalDays, getToday } from '../utils/srs'

export function CreateFlashcardForm() {
  const { addCard, cards, deleteCard } = useFlashcards()
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [example, setExample] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const result = addCard(front, back, example || undefined)
    if (!result.ok) {
      setError(result.error ?? 'Erro ao criar card.')
      return
    }

    setFront('')
    setBack('')
    setExample('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h2 className="mb-1 text-xl font-black text-white">Criar flashcard</h2>
      <p className="mb-6 text-sm text-white/70">Frente, verso e exemplo opcional</p>

      <form onSubmit={handleSubmit} className="duo-card mb-6 p-6">
        <div className="mb-4">
          <label htmlFor="front" className="mb-1 block text-sm font-bold text-duo-text">
            Frente *
          </label>
          <input
            id="front"
            value={front}
            onChange={(e) => setFront(e.target.value.slice(0, 200))}
            maxLength={200}
            required
            placeholder="Ex.: Olá"
            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-duo-blue"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="back" className="mb-1 block text-sm font-bold text-duo-text">
            Verso *
          </label>
          <input
            id="back"
            value={back}
            onChange={(e) => setBack(e.target.value.slice(0, 200))}
            maxLength={200}
            required
            placeholder="Ex.: Hello"
            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-duo-blue"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="example" className="mb-1 block text-sm font-bold text-duo-text">
            Exemplo (opcional)
          </label>
          <textarea
            id="example"
            value={example}
            onChange={(e) => setExample(e.target.value.slice(0, 200))}
            maxLength={200}
            rows={2}
            placeholder='Ex.: "Hello, how are you?"'
            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-duo-blue"
          />
        </div>

        {error && (
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-duo-red">{error}</p>
        )}
        {success && (
          <p className="mb-3 rounded-xl bg-green-50 px-3 py-2 text-sm font-bold text-duo-green">
            Flashcard criado! Disponível na revisão de hoje.
          </p>
        )}

        <button type="submit" className="duo-btn duo-btn-green w-full">
          Adicionar flashcard
        </button>

        <SrsLegend />
      </form>

      {cards.length > 0 && (
        <div className="duo-card p-4">
          <h3 className="mb-3 font-extrabold text-duo-text">Seus cards ({cards.length})</h3>
          <ul className="flex flex-col gap-2">
            {[...cards].reverse().map((card) => (
              <li
                key={card.id}
                className="flex items-start justify-between gap-2 rounded-xl bg-gray-50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-duo-text">{card.front}</p>
                  <p className="truncate text-sm text-duo-gray">{card.back}</p>
                  {card.example && (
                    <p className="mt-1 truncate text-xs italic text-duo-blue">{card.example}</p>
                  )}
                  <p className="mt-1 text-xs text-duo-gray">
                    Revisão: {card.nextReviewDate}
                    {card.nextReviewDate <= getToday() && (
                      <span className="ml-1 font-bold text-duo-orange">· pendente</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCard(card.id)}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-duo-red hover:bg-red-50"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function SrsLegend() {
  const today = getToday()
  return (
    <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-duo-blue-dark">
      <p className="font-bold">Agenda de repetição</p>
      <p className="mt-1">
        Errou → {getNextIntervalDays(0, false)} dia · 1º acerto → {getNextIntervalDays(1, true)} dias ·
        2º → {getNextIntervalDays(2, true)} · 3º → {getNextIntervalDays(3, true)} · 4º →{' '}
        {getNextIntervalDays(4, true)}…
      </p>
      <p className="mt-1 text-duo-gray">Hoje: {today}</p>
    </div>
  )
}
