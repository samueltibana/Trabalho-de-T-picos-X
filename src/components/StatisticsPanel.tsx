import { useFlashcards } from '../store/FlashcardContext'

function formatDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

export function StatisticsPanel() {
  const { stats, evolution, cards } = useFlashcards()
  const maxBar = Math.max(1, ...evolution.map((d) => d.correct + d.wrong))

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h2 className="mb-1 text-xl font-black text-white">Estatísticas</h2>
      <p className="mb-6 text-sm text-white/70">Acertos, erros, pendentes e evolução</p>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard label="Acertos" value={stats.totalCorrect} color="text-duo-green" bg="bg-green-50" />
        <StatCard label="Erros" value={stats.totalWrong} color="text-duo-red" bg="bg-red-50" />
        <StatCard
          label="Pendentes hoje"
          value={stats.pendingToday}
          color="text-duo-orange"
          bg="bg-orange-50"
        />
        <StatCard label="Total de cards" value={stats.totalCards} color="text-duo-blue" bg="bg-blue-50" />
      </div>

      <div className="duo-card mb-6 p-4">
        <h3 className="mb-1 font-extrabold text-duo-text">Hoje</h3>
        <p className="text-sm text-duo-gray">
          {stats.reviewedToday} revisões realizadas · {stats.pendingToday} ainda pendentes
        </p>
        {stats.totalCards > 0 && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-duo-green"
              style={{
                width: `${Math.round(((stats.totalCards - stats.pendingToday) / stats.totalCards) * 100)}%`,
              }}
            />
          </div>
        )}
        <p className="mt-1 text-xs text-duo-gray">Progresso do baralho revisado hoje</p>
      </div>

      <div className="duo-card p-4">
        <h3 className="mb-4 font-extrabold text-duo-text">Evolução (14 dias)</h3>
        {evolution.every((d) => d.correct === 0 && d.wrong === 0) ? (
          <p className="text-sm text-duo-gray">Nenhuma revisão registrada ainda.</p>
        ) : (
          <div className="flex items-end justify-between gap-1" style={{ height: 120 }}>
            {evolution.map((day) => {
              const total = day.correct + day.wrong
              const height = total > 0 ? (total / maxBar) * 100 : 4
              const correctPct = total > 0 ? (day.correct / total) * 100 : 0

              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="relative w-full overflow-hidden rounded-t-md bg-red-200"
                    style={{ height: `${height}%`, minHeight: total > 0 ? 8 : 4 }}
                    title={`${day.date}: ${day.correct} acertos, ${day.wrong} erros`}
                  >
                    {day.correct > 0 && (
                      <div
                        className="absolute bottom-0 w-full bg-duo-green"
                        style={{ height: `${correctPct}%` }}
                      />
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-duo-gray">{formatDateLabel(day.date)}</span>
                </div>
              )
            })}
          </div>
        )}
        <div className="mt-3 flex gap-4 text-xs text-duo-gray">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-duo-green" /> Acertos
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-red-300" /> Erros
          </span>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="duo-card mt-6 p-4">
          <h3 className="mb-3 font-extrabold text-duo-text">Agenda por card</h3>
          <ul className="flex flex-col gap-2">
            {[...cards]
              .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))
              .slice(0, 10)
              .map((card) => (
                <li key={card.id} className="flex justify-between text-sm">
                  <span className="truncate font-bold text-duo-text">{card.front}</span>
                  <span className="shrink-0 text-duo-gray">
                    {card.nextReviewDate}
                    {card.correctStreak > 0 && (
                      <span className="ml-1 text-duo-green">· seq. {card.correctStreak}</span>
                    )}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
  bg,
}: {
  label: string
  value: number
  color: string
  bg: string
}) {
  return (
    <div className={`duo-card ${bg} p-4 text-center`}>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-xs font-bold text-duo-gray">{label}</p>
    </div>
  )
}
