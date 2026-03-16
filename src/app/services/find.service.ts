import { Injectable, signal, computed } from '@angular/core';
import {
  DetectorItem,
  ItemCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_XP,
  CATEGORIES_BY_XP,
} from '../models/find.model';

const STORAGE_KEY = 'metaldetecting_finds';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly itemsSignal = signal<DetectorItem[]>(this.loadFromStorage());

  readonly items = this.itemsSignal.asReadonly();
  readonly totalItems = computed(() => this.itemsSignal().length);

  readonly totalValue = computed(() =>
    this.itemsSignal().reduce((sum, f) => sum + (f.estimatedValue || 0), 0)
  );

  readonly bestItem = computed(() => {
    const all = this.itemsSignal();
    if (!all.length) return null;
    return all.reduce((best, f) => f.estimatedValue > best.estimatedValue ? f : best);
  });

  readonly recentItems = computed(() =>
    [...this.itemsSignal()]
      .sort((a, b) => new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime())
      .slice(0, 5)
  );

  readonly categoryBreakdown = computed(() => {
    const counts: Partial<Record<ItemCategory, number>> = {};
    for (const f of this.itemsSignal()) {
      counts[f.category] = (counts[f.category] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([key, value]) => ({
        category: key as ItemCategory,
        label: CATEGORY_LABELS[key as ItemCategory],
        count: value!,
      }))
      .sort((a, b) => b.count - a.count);
  });

  /** All categories sorted by XP (high→low) with count and drop rate */
  readonly categorySummary = computed(() => {
    const total = this.itemsSignal().length;
    const counts: Record<string, number> = {};
    for (const f of this.itemsSignal()) {
      counts[f.category] = (counts[f.category] || 0) + 1;
    }
    return CATEGORIES_BY_XP.map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      icon: CATEGORY_ICONS[cat],
      xp: CATEGORY_XP[cat],
      count: counts[cat] || 0,
      dropRate: total > 0 ? ((counts[cat] || 0) / total) * 100 : 0,
    }));
  });

  readonly monthlyItems = computed(() => {
    const months: Record<string, number> = {};
    for (const f of this.itemsSignal()) {
      const date = new Date(f.dateFound);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    }
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  });

  readonly valueByCategory = computed(() => {
    const values: Partial<Record<ItemCategory, number>> = {};
    for (const f of this.itemsSignal()) {
      values[f.category] = (values[f.category] || 0) + (f.estimatedValue || 0);
    }
    return Object.entries(values)
      .map(([key, value]) => ({
        category: key as ItemCategory,
        label: CATEGORY_LABELS[key as ItemCategory],
        value: value!,
      }))
      .sort((a, b) => b.value - a.value);
  });

  /** Get drop rate for a specific category */
  getDropRate(category: ItemCategory): number {
    const total = this.itemsSignal().length;
    if (!total) return 0;
    const count = this.itemsSignal().filter((f) => f.category === category).length;
    return (count / total) * 100;
  }

  getById(id: string): DetectorItem | undefined {
    return this.itemsSignal().find((f) => f.id === id);
  }

  searchItems(query: string): DetectorItem[] {
    const q = query.toLowerCase();
    return this.itemsSignal().filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.notes.toLowerCase().includes(q)
    );
  }

  add(item: Omit<DetectorItem, 'id'>): DetectorItem {
    const newItem: DetectorItem = { ...item, id: crypto.randomUUID() };
    this.itemsSignal.update((items) => [...items, newItem]);
    this.saveToStorage();
    return newItem;
  }

  update(id: string, changes: Partial<DetectorItem>): void {
    this.itemsSignal.update((items) =>
      items.map((f) => (f.id === id ? { ...f, ...changes } : f))
    );
    this.saveToStorage();
  }

  delete(id: string): void {
    this.itemsSignal.update((items) => items.filter((f) => f.id !== id));
    this.saveToStorage();
  }

  private loadFromStorage(): DetectorItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.itemsSignal()));
  }
}
