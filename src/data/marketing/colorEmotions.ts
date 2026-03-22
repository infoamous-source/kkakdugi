import type { ColorEmotion } from '../../types/marketing';

export const colorEmotions: ColorEmotion[] = [
  {
    id: 'trust',
    emotion: 'Trust',
    emotionKo: '신뢰',
    description: '믿음직하고 안정적인 느낌이에요',
    mainColor: { hex: '#1E3A8A', name: 'Navy Blue', nameKo: '네이비 블루' },
    subColors: [
      { hex: '#3B82F6', name: 'Blue', nameKo: '블루' },
      { hex: '#E0E7FF', name: 'Light Indigo', nameKo: '연한 인디고' },
      { hex: '#F8FAFC', name: 'Slate White', nameKo: '슬레이트 화이트' },
    ],
  },
  {
    id: 'passion',
    emotion: 'Passion',
    emotionKo: '열정',
    description: '강렬하고 에너지가 넘치는 느낌이에요',
    mainColor: { hex: '#DC2626', name: 'Red', nameKo: '레드' },
    subColors: [
      { hex: '#F97316', name: 'Orange', nameKo: '오렌지' },
      { hex: '#FEF2F2', name: 'Rose White', nameKo: '로즈 화이트' },
      { hex: '#1F2937', name: 'Dark Gray', nameKo: '다크 그레이' },
    ],
  },
  {
    id: 'calm',
    emotion: 'Calm',
    emotionKo: '차분함',
    description: '편안하고 마음이 쉬는 느낌이에요',
    mainColor: { hex: '#059669', name: 'Emerald', nameKo: '에메랄드' },
    subColors: [
      { hex: '#A7F3D0', name: 'Mint', nameKo: '민트' },
      { hex: '#F0FDF4', name: 'Green White', nameKo: '그린 화이트' },
      { hex: '#6B7280', name: 'Gray', nameKo: '그레이' },
    ],
  },
  {
    id: 'luxury',
    emotion: 'Luxury',
    emotionKo: '고급스러움',
    description: '비싸 보이고 특별한 느낌이에요',
    mainColor: { hex: '#1F2937', name: 'Charcoal', nameKo: '차콜' },
    subColors: [
      { hex: '#D4AF37', name: 'Gold', nameKo: '골드' },
      { hex: '#F5F5F4', name: 'Off White', nameKo: '오프 화이트' },
      { hex: '#78716C', name: 'Warm Gray', nameKo: '웜 그레이' },
    ],
  },
  {
    id: 'friendly',
    emotion: 'Friendly',
    emotionKo: '친근함',
    description: '따뜻하고 친구 같은 느낌이에요',
    mainColor: { hex: '#F59E0B', name: 'Amber', nameKo: '앰버' },
    subColors: [
      { hex: '#FB923C', name: 'Light Orange', nameKo: '라이트 오렌지' },
      { hex: '#FFFBEB', name: 'Cream', nameKo: '크림' },
      { hex: '#92400E', name: 'Brown', nameKo: '브라운' },
    ],
  },
  {
    id: 'creative',
    emotion: 'Creative',
    emotionKo: '창의적',
    description: '독특하고 새로운 느낌이에요',
    mainColor: { hex: '#7C3AED', name: 'Violet', nameKo: '바이올렛' },
    subColors: [
      { hex: '#EC4899', name: 'Pink', nameKo: '핑크' },
      { hex: '#FAF5FF', name: 'Lavender White', nameKo: '라벤더 화이트' },
      { hex: '#4338CA', name: 'Indigo', nameKo: '인디고' },
    ],
  },
  {
    id: 'fresh',
    emotion: 'Fresh',
    emotionKo: '상쾌함',
    description: '깨끗하고 젊은 느낌이에요',
    mainColor: { hex: '#06B6D4', name: 'Cyan', nameKo: '시안' },
    subColors: [
      { hex: '#22D3EE', name: 'Sky', nameKo: '스카이' },
      { hex: '#ECFEFF', name: 'Ice White', nameKo: '아이스 화이트' },
      { hex: '#155E75', name: 'Teal', nameKo: '틸' },
    ],
  },
  {
    id: 'natural',
    emotion: 'Natural',
    emotionKo: '자연스러움',
    description: '자연과 건강한 느낌이에요',
    mainColor: { hex: '#65A30D', name: 'Lime', nameKo: '라임' },
    subColors: [
      { hex: '#A3E635', name: 'Light Green', nameKo: '라이트 그린' },
      { hex: '#F7FEE7', name: 'Natural White', nameKo: '내추럴 화이트' },
      { hex: '#3F6212', name: 'Olive', nameKo: '올리브' },
    ],
  },
];
