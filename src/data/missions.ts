import type { Mission } from '../types'

export const missions: Mission[] = [
  {
    id: 'mission-lessons',
    title: 'Estudante dedicado',
    description: 'Complete 2 lições hoje',
    icon: '📚',
    target: 2,
    xpReward: 30,
    metric: 'lessons',
  },
  {
    id: 'mission-correct',
    title: 'Mira certeira',
    description: 'Acerte 8 respostas hoje',
    icon: '🎯',
    target: 8,
    xpReward: 25,
    metric: 'correct',
  },
  {
    id: 'mission-xp',
    title: 'Caçador de XP',
    description: 'Ganhe 50 XP hoje',
    icon: '⚡',
    target: 50,
    xpReward: 20,
    metric: 'xp',
  },
  {
    id: 'mission-streak',
    title: 'Sequência de fogo',
    description: 'Mantenha uma sequência de 3 dias',
    icon: '🔥',
    target: 3,
    xpReward: 40,
    metric: 'streak',
  },
]
