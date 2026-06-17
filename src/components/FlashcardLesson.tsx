import { useCallback, useMemo, useState } from 'react'
import type { Lesson, LessonResult } from '../types'
import { validateAnswerInput } from '../security/validation'
import { buildQuestions, calcStars, calcXp, checkAnswer, getQuestionLabel } from '../utils/game'
import { useGame } from '../store/GameContext'

interface FlashcardLessonProps {
  lesson: Lesson
  onComplete: (result: LessonResult) => void
  onQuit: () => void
  onOutOfHearts: () => void
}

type Feedback = 'none' | 'correct' | 'wrong'

export function FlashcardLesson({ lesson, onComplete, onQuit, onOutOfHearts }: FlashcardLessonProps) {
  const { loseHeart, recordCorrect, state } = useGame()
  const questions = useMemo(() => buildQuestions(lesson), [lesson])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>('none')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [shake, setShake] = useState(false)
  const [outOfHearts, setOutOfHearts] = useState(false)
  const [inputError, setInputError] = useState<string | null>(null)

  const question = questions[currentIndex]
  const progress = ((currentIndex + (feedback !== 'none' ? 1 : 0)) / questions.length) * 100
  const isChoice = question.type === 'choice-to-en' || question.type === 'choice-to-pt'

  const handleCheck = useCallback(() => {
    if (feedback !== 'none') return

    let userAnswer = isChoice ? selectedOption ?? '' : typedAnswer
    if (!userAnswer.trim()) return

    if (!isChoice) {
      const validation = validateAnswerInput(userAnswer)
      if (!validation.valid || !validation.sanitized) {
        setInputError(validation.error ?? 'Entrada inválida.')
        return
      }
      userAnswer = validation.sanitized
      setInputError(null)
    }

    const correct = checkAnswer(userAnswer, question.answer)

    if (correct) {
      setFeedback('correct')
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      recordCorrect()
    } else {
      setFeedback('wrong')
      setStreak(0)
      loseHeart()
      if (state.hearts <= 1) setOutOfHearts(true)
      setShake(true)
      setTimeout(() => setShake(false), 400)
    }
  }, [feedback, isChoice, selectedOption, typedAnswer, question, recordCorrect, loseHeart, state.hearts])

  const handleContinue = useCallback(() => {
    const nextIndex = currentIndex + 1

    if (nextIndex >= questions.length) {
      const result: LessonResult = {
        score,
        total: questions.length,
        xpEarned: calcXp(lesson.xpReward, score, questions.length, streak),
        stars: calcStars(score, questions.length),
        perfect: score === questions.length,
      }
      onComplete(result)
      return
    }

    if (outOfHearts) {
      onOutOfHearts()
      return
    }

    setCurrentIndex(nextIndex)
    setFeedback('none')
    setSelectedOption(null)
    setTypedAnswer('')
  }, [
    currentIndex,
    questions.length,
    score,
    lesson.xpReward,
    streak,
    onComplete,
    feedback,
    outOfHearts,
    onOutOfHearts,
  ])

  const handleOptionClick = (option: string) => {
    if (feedback !== 'none') return
    setSelectedOption(option)
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col px-4 pb-8 pt-4">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onQuit}
          className="rounded-xl p-2 text-white/70 hover:bg-white/10"
          aria-label="Sair"
        >
          ✕
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-duo-green transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-bold text-white">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      <div className={`duo-card flex-1 p-6 ${shake ? 'animate-shake' : 'animate-bounce-in'}`}>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-duo-blue">
          {getQuestionLabel(question.type)}
        </p>

        <div className="mb-6 rounded-2xl bg-gray-50 p-6 text-center">
          <p className="text-3xl font-black text-duo-text">{question.prompt}</p>
          {question.card.hint && (
            <p className="mt-2 text-sm text-duo-gray">Dica: {question.card.hint}</p>
          )}
        </div>

        {streak >= 3 && feedback === 'none' && (
          <div className="mb-4 rounded-xl bg-orange-100 px-3 py-2 text-center text-sm font-bold text-duo-orange animate-pop">
            🔥 Sequência de {streak}!
          </div>
        )}

        {isChoice ? (
          <div className="flex flex-col gap-3">
            {question.options?.map((option) => {
              let className = 'duo-option'
              if (feedback !== 'none') {
                if (checkAnswer(option, question.answer)) className += ' duo-option-correct'
                else if (option === selectedOption) className += ' duo-option-wrong'
              } else if (option === selectedOption) {
                className += ' duo-option-selected'
              }

              return (
                <button
                  key={option}
                  type="button"
                  disabled={feedback !== 'none'}
                  onClick={() => handleOptionClick(option)}
                  className={className}
                >
                  {option}
                </button>
              )
            })}
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => {
                setInputError(null)
                setTypedAnswer(e.target.value.slice(0, 120))
              }}
              maxLength={120}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  feedback === 'none' ? handleCheck() : handleContinue()
                }
              }}
              disabled={feedback !== 'none'}
              placeholder="Digite sua resposta..."
              className={`w-full rounded-2xl border-2 px-4 py-4 text-lg font-bold outline-none transition ${
                feedback === 'correct'
                  ? 'border-duo-green bg-green-50'
                  : feedback === 'wrong'
                    ? 'border-duo-red bg-red-50'
                    : 'border-gray-200 focus:border-duo-blue'
              }`}
              autoFocus
            />
            {inputError && (
              <p className="mt-2 text-sm font-bold text-duo-red">{inputError}</p>
            )}
            {feedback === 'wrong' && (
              <p className="mt-2 text-sm font-bold text-duo-red">
                Resposta correta: {question.answer}
              </p>
            )}
          </div>
        )}

        {feedback !== 'none' && isChoice && feedback === 'wrong' && (
          <p className="mt-3 text-sm font-bold text-duo-red">
            Resposta correta: {question.answer}
          </p>
        )}
      </div>

      <div className="mt-6">
        {feedback === 'none' ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={isChoice ? !selectedOption : !typedAnswer.trim()}
            className="duo-btn duo-btn-green w-full disabled:opacity-50"
          >
            Verificar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleContinue}
            className={`duo-btn w-full ${
              feedback === 'correct' ? 'duo-btn-green' : 'duo-btn-red'
            }`}
          >
            {currentIndex + 1 >= questions.length ? 'Ver resultado' : 'Continuar'}
          </button>
        )}
      </div>

      {outOfHearts && feedback === 'wrong' && (
        <p className="mt-3 text-center text-sm font-bold text-duo-red">
          Sem vidas restantes!
        </p>
      )}
    </div>
  )
}
