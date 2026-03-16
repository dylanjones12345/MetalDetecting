export interface DetectorFind {
  id: string;
  name: string;
  category: FindCategory;
  material: FindMaterial;
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
  | 'coin'
  | 'jewelry'
  | 'relic'
  | 'button'
  | 'bullet'
  | 'tool'
  | 'toy'
  | 'buckle'
  | 'token'
  | 'junk'
  | 'other';

export type FindMaterial =
  | 'gold'
  | 'silver'
  | 'copper'
  | 'bronze'
  | 'iron'
  | 'lead'
  | 'aluminum'
  | 'zinc'
  | 'nickel'
  | 'pewter'
  | 'brass'
  | 'other';

export type FindCondition = 'excellent' | 'good' | 'fair' | 'poor';

export const CATEGORY_LABELS: Record<FindCategory, string> = {
  coin: 'Coin',
  jewelry: 'Jewelry',
  relic: 'Relic',
  button: 'Button',
  bullet: 'Bullet / Casing',
  tool: 'Tool',
  toy: 'Toy',
  buckle: 'Buckle',
  token: 'Token',
  junk: 'Junk',
  other: 'Other',
};

export const MATERIAL_LABELS: Record<FindMaterial, string> = {
  gold: 'Gold',
  silver: 'Silver',
  copper: 'Copper',
  bronze: 'Bronze',
  iron: 'Iron',
  lead: 'Lead',
  aluminum: 'Aluminum',
  zinc: 'Zinc',
  nickel: 'Nickel',
  pewter: 'Pewter',
  brass: 'Brass',
  other: 'Other',
};

export const CONDITION_LABELS: Record<FindCondition, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export const CATEGORY_ICONS: Record<FindCategory, string> = {
  coin: '🪙',
  jewelry: '💍',
  relic: '🏺',
  button: '⚙️',
  bullet: '🔩',
  tool: '🔧',
  toy: '🧸',
  buckle: '🔗',
  token: '🎖️',
  junk: '♻️',
  other: '❓',
};
