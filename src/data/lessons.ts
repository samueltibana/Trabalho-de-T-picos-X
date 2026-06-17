import type { Flashcard, Lesson, Unit } from '../types'

const basics: Flashcard[] = [
  { id: 'b1', pt: 'Olá', en: 'Hello' },
  { id: 'b2', pt: 'Obrigado', en: 'Thank you' },
  { id: 'b3', pt: 'Por favor', en: 'Please' },
  { id: 'b4', pt: 'Sim', en: 'Yes' },
  { id: 'b5', pt: 'Não', en: 'No' },
]

const greetings: Flashcard[] = [
  { id: 'g1', pt: 'Bom dia', en: 'Good morning' },
  { id: 'g2', pt: 'Boa tarde', en: 'Good afternoon' },
  { id: 'g3', pt: 'Boa noite', en: 'Good night' },
  { id: 'g4', pt: 'Tchau', en: 'Goodbye' },
  { id: 'g5', pt: 'Como vai?', en: 'How are you?' },
]

const family: Flashcard[] = [
  { id: 'f1', pt: 'Mãe', en: 'Mother' },
  { id: 'f2', pt: 'Pai', en: 'Father' },
  { id: 'f3', pt: 'Irmão', en: 'Brother' },
  { id: 'f4', pt: 'Irmã', en: 'Sister' },
  { id: 'f5', pt: 'Família', en: 'Family' },
]

const food: Flashcard[] = [
  { id: 'fd1', pt: 'Água', en: 'Water' },
  { id: 'fd2', pt: 'Pão', en: 'Bread' },
  { id: 'fd3', pt: 'Maçã', en: 'Apple' },
  { id: 'fd4', pt: 'Café', en: 'Coffee' },
  { id: 'fd5', pt: 'Leite', en: 'Milk' },
]

const travel: Flashcard[] = [
  { id: 't1', pt: 'Aeroporto', en: 'Airport' },
  { id: 't2', pt: 'Passaporte', en: 'Passport' },
  { id: 't3', pt: 'Hotel', en: 'Hotel' },
  { id: 't4', pt: 'Mapa', en: 'Map' },
  { id: 't5', pt: 'Trem', en: 'Train' },
]

const work: Flashcard[] = [
  { id: 'w1', pt: 'Escritório', en: 'Office' },
  { id: 'w2', pt: 'Reunião', en: 'Meeting' },
  { id: 'w3', pt: 'Computador', en: 'Computer' },
  { id: 'w4', pt: 'E-mail', en: 'Email' },
  { id: 'w5', pt: 'Projeto', en: 'Project' },
]

const advanced: Flashcard[] = [
  { id: 'a1', pt: 'Empreendedorismo', en: 'Entrepreneurship', hint: 'Business' },
  { id: 'a2', pt: 'Sustentabilidade', en: 'Sustainability', hint: 'Environment' },
  { id: 'a3', pt: 'Consciência', en: 'Awareness', hint: 'Mind' },
  { id: 'a4', pt: 'Perspectiva', en: 'Perspective', hint: 'Viewpoint' },
  { id: 'a5', pt: 'Conquista', en: 'Achievement', hint: 'Success' },
]

export const units: Unit[] = [
  {
    id: 'unit-1',
    title: 'Fundamentos',
    subtitle: 'Primeiros passos em inglês',
    color: '#58CC02',
    icon: '🌱',
    lessons: [
      {
        id: 'lesson-1-1',
        unitId: 'unit-1',
        title: 'Saudações básicas',
        description: 'Aprenda olá, sim e não',
        difficulty: 1,
        xpReward: 10,
        cards: basics.slice(0, 3),
        questionTypes: ['choice-to-en'],
      },
      {
        id: 'lesson-1-2',
        unitId: 'unit-1',
        title: 'Palavras essenciais',
        description: 'Complete o vocabulário básico',
        difficulty: 1,
        xpReward: 15,
        cards: basics,
        questionTypes: ['choice-to-en', 'choice-to-pt'],
      },
      {
        id: 'lesson-1-3',
        unitId: 'unit-1',
        title: 'Cumprimentos',
        description: 'Bom dia, boa tarde e mais',
        difficulty: 2,
        xpReward: 20,
        cards: greetings,
        questionTypes: ['choice-to-en', 'choice-to-pt'],
      },
    ],
  },
  {
    id: 'unit-2',
    title: 'Vida cotidiana',
    subtitle: 'Família e alimentação',
    color: '#1CB0F6',
    icon: '🏠',
    lessons: [
      {
        id: 'lesson-2-1',
        unitId: 'unit-2',
        title: 'Família',
        description: 'Membros da família',
        difficulty: 2,
        xpReward: 25,
        cards: family,
        questionTypes: ['choice-to-en', 'choice-to-pt'],
      },
      {
        id: 'lesson-2-2',
        unitId: 'unit-2',
        title: 'Comida e bebida',
        description: 'Itens do dia a dia',
        difficulty: 2,
        xpReward: 25,
        cards: food,
        questionTypes: ['choice-to-en', 'choice-to-pt', 'type-answer'],
      },
      {
        id: 'lesson-2-3',
        unitId: 'unit-2',
        title: 'Desafio mix',
        description: 'Família + comida combinados',
        difficulty: 3,
        xpReward: 35,
        cards: [...family.slice(0, 3), ...food.slice(0, 3)],
        questionTypes: ['choice-to-pt', 'type-answer'],
      },
    ],
  },
  {
    id: 'unit-3',
    title: 'Explorador',
    subtitle: 'Viagens e trabalho',
    color: '#FF9600',
    icon: '✈️',
    lessons: [
      {
        id: 'lesson-3-1',
        unitId: 'unit-3',
        title: 'Viagem',
        description: 'Vocabulário de aeroporto e hotel',
        difficulty: 3,
        xpReward: 40,
        cards: travel,
        questionTypes: ['choice-to-en', 'type-answer'],
      },
      {
        id: 'lesson-3-2',
        unitId: 'unit-3',
        title: 'Trabalho',
        description: 'Termos de escritório',
        difficulty: 3,
        xpReward: 40,
        cards: work,
        questionTypes: ['choice-to-pt', 'type-answer', 'reverse-type'],
      },
      {
        id: 'lesson-3-3',
        unitId: 'unit-3',
        title: 'Boss fight',
        description: 'Viagem + trabalho — nível difícil',
        difficulty: 4,
        xpReward: 50,
        cards: [...travel.slice(0, 3), ...work.slice(0, 3)],
        questionTypes: ['type-answer', 'reverse-type'],
      },
    ],
  },
  {
    id: 'unit-4',
    title: 'Mestre',
    subtitle: 'Vocabulário avançado',
    color: '#CE82FF',
    icon: '👑',
    lessons: [
      {
        id: 'lesson-4-1',
        unitId: 'unit-4',
        title: 'Palavras complexas',
        description: 'Termos de nível avançado',
        difficulty: 4,
        xpReward: 60,
        cards: advanced,
        questionTypes: ['type-answer', 'reverse-type'],
      },
      {
        id: 'lesson-4-2',
        unitId: 'unit-4',
        title: 'Desafio final',
        description: 'Prove que você é fluente!',
        difficulty: 4,
        xpReward: 80,
        cards: [...advanced, ...travel.slice(0, 2)],
        questionTypes: ['type-answer', 'reverse-type', 'choice-to-en'],
      },
    ],
  },
]

export function getAllLessons(): Lesson[] {
  return units.flatMap((u) => u.lessons)
}

export function getLessonById(id: string): Lesson | undefined {
  return getAllLessons().find((l) => l.id === id)
}

export function getLessonIndex(lessonId: string): number {
  return getAllLessons().findIndex((l) => l.id === lessonId)
}

export function getAllCards(): Flashcard[] {
  return getAllLessons().flatMap((l) => l.cards)
}

export function getDistractors(correct: string, pool: string[], count = 3): string[] {
  const filtered = pool.filter((w) => w.toLowerCase() !== correct.toLowerCase())
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
