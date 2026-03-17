export interface DetectorItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  tone: ItemTone;
  dateFound: string;
  location: string;
  depth: number;
  depthUnit: 'in' | 'cm';
  condition: ItemCondition;
  estimatedValue: number;
  weight: number;
  weightUnit: 'g' | 'oz';
  notes: string;
  imageUrl: string;
}

export type ItemCategory =
  | 'gold'
  | 'silver'
  | 'coin'
  | 'fake_jewelry'
  | 'phone'
  | 'toys'
  | 'vape'
  | 'junk';

export type ItemTone = 'high' | 'mid_high' | 'mid' | 'mid_low' | 'low' | 'iron';

export type ItemCondition = 'excellent' | 'good' | 'fair' | 'poor';

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  gold: 'Gold',
  silver: 'Silver',
  coin: 'Coin',
  fake_jewelry: 'Fake Jewelry',
  phone: 'Phone',
  toys: 'Toys',
  vape: 'Vape',
  junk: 'Junk',
};

export const TONE_LABELS: Record<ItemTone, string> = {
  high: 'High Tone',
  mid_high: 'Mid-High Tone',
  mid: 'Mid Tone',
  mid_low: 'Mid-Low Tone',
  low: 'Low Tone',
  iron: 'Iron Grunt',
};

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export const CATEGORY_ICONS: Record<ItemCategory, string> = {
  gold: '✨',
  silver: '🥈',
  coin: '🪙',
  fake_jewelry: '💍',
  phone: '📱',
  toys: '🧸',
  vape: '💨',
  junk: '♻️',
};

export const CATEGORY_XP: Record<ItemCategory, number> = {
  gold: 1500,
  silver: 800,
  coin: 500,
  fake_jewelry: 300,
  phone: 250,
  toys: 150,
  vape: 75,
  junk: 25,
};

export const CATEGORIES_BY_XP: ItemCategory[] = [
  'gold', 'silver', 'coin', 'fake_jewelry', 'phone', 'toys', 'vape', 'junk',
];
