export interface DetectorFind {
  id: string;
  name: string;
  category: FindCategory;
  dateFound: string;
  location: string;
  depth: number;
  depthUnit: 'in' | 'cm';
  condition: FindCondition;
  estimatedValue: number;
  weight: number;
  weightUnit: 'g' | 'oz';
  notes: string;
  imageUrl: string;
}

export type FindCategory =
  | 'gold'
  | 'silver'
  | 'coin'
  | 'fake_jewelry'
  | 'phone'
  | 'toys'
  | 'vape'
  | 'junk';

export type FindCondition = 'excellent' | 'good' | 'fair' | 'poor';

export const CATEGORY_LABELS: Record<FindCategory, string> = {
  gold: 'Gold',
  silver: 'Silver',
  coin: 'Coin',
  fake_jewelry: 'Fake Jewelry',
  phone: 'Phone',
  toys: 'Toys',
  vape: 'Vape',
  junk: 'Junk',
};

export const CONDITION_LABELS: Record<FindCondition, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export const CATEGORY_ICONS: Record<FindCategory, string> = {
  gold: '✨',
  silver: '🥈',
  coin: '🪙',
  fake_jewelry: '💍',
  phone: '📱',
  toys: '🧸',
  vape: '💨',
  junk: '♻️',
};

export const CATEGORY_XP: Record<FindCategory, number> = {
  gold: 1500,
  silver: 800,
  coin: 500,
  fake_jewelry: 300,
  phone: 250,
  toys: 150,
  vape: 75,
  junk: 25,
};
