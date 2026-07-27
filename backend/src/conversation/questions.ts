import type { RecommendationQuestion } from './conversation.types'

export const RECOMMENDATION_QUESTIONS: RecommendationQuestion[] = [
  {
    key: 'category',
    text: '어떤 종류가 당기세요?',
    description: '오늘의 기분에 가장 가까운 것을 골라주세요.',
    selectionType: 'SINGLE',
    options: [
      { value: 'KOREAN', label: '한식', icon: '🍚' },
      { value: 'CHINESE', label: '중식', icon: '🥟' },
      { value: 'WESTERN', label: '양식', icon: '🍝' },
      { value: 'JAPANESE', label: '일식', icon: '🍣' },
      { value: 'ANY', label: '상관없어요', icon: '✨' },
    ],
  },
  {
    key: 'mealForm',
    text: '어떤 식사가 좋으세요?',
    description: '오늘은 어떤 한 끼를 원하시나요?',
    selectionType: 'SINGLE',
    options: [
      { value: 'RICE', label: '밥', icon: '🍚' },
      { value: 'NOODLE', label: '면', icon: '🍜' },
      { value: 'SOUP', label: '국물', icon: '🥘' },
      { value: 'LIGHT', label: '가벼운 메뉴', icon: '🥗' },
      { value: 'ANY', label: '상관없어요', icon: '✨' },
    ],
  },
  {
    key: 'tastes',
    text: '오늘은 어떤 맛인가요?',
    description: '하나 이상의 맛을 골라주세요.',
    selectionType: 'MULTIPLE',
    options: [
      { value: 'SPICY', label: '매콤한 맛', icon: '🌶️' },
      { value: 'MILD', label: '담백한 맛', icon: '🫧' },
      { value: 'REFRESHING', label: '시원한 맛', icon: '❄️' },
      { value: 'ANY', label: '상관없어요', icon: '✨' },
    ],
  },
  {
    key: 'situation',
    text: '어떤 상황인가요?',
    description: '마지막 질문이에요.',
    selectionType: 'SINGLE',
    options: [
      { value: 'SOLO', label: '혼자 먹어요', icon: '🙋' },
      { value: 'HEARTY', label: '든든하게', icon: '💪' },
      { value: 'QUICK', label: '빨리 먹고 싶어요', icon: '⏱️' },
      { value: 'GROUP', label: '여럿이 함께', icon: '👥' },
      { value: 'ANY', label: '상관없어요', icon: '✨' },
    ],
  },
]
