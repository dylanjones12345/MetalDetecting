import { Injectable, signal, computed } from '@angular/core';
import {
  DetectorFind,
  FindCategory,
  CATEGORY_LABELS,
} from '../models/find.model';

const STORAGE_KEY = 'metaldetecting_finds';

@Injectable({ providedIn: 'root' })
export class FindService {
  private readonly findsSignal = signal<DetectorFind[]>(this.loadFromStorage());

  readonly finds = this.findsSignal.asReadonly();

  readonly totalFinds = computed(() => this.findsSignal().length);

  readonly totalValue = computed(() =>
    this.findsSignal().reduce((sum, f) => sum + (f.estimatedValue || 0), 0)
  );

  readonly averageDepth = computed(() => {
    const items = this.findsSignal();
    if (!items.length) return 0;
    const totalInches = items.reduce((sum, f) => {
      return sum + (f.depthUnit === 'cm' ? f.depth * 0.3937 : f.depth);
    }, 0);
    return totalInches / items.length;
  });

  readonly bestFind = computed(() => {
    const items = this.findsSignal();
    if (!items.length) return null;
    return items.reduce((best, f) =>
      f.estimatedValue > best.estimatedValue ? f : best
    );
  });

  readonly recentFinds = computed(() =>
    [...this.findsSignal()]
      .sort((a, b) => new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime())
      .slice(0, 5)
  );

  readonly categoryBreakdown = computed(() => {
    const counts: Partial<Record<FindCategory, number>> = {};
    for (const f of this.findsSignal()) {
      counts[f.category] = (counts[f.category] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([key, value]) => ({
        category: key as FindCategory,
        label: CATEGORY_LABELS[key as FindCategory],
        count: value!,
      }))
      .sort((a, b) => b.count - a.count);
  });

  readonly monthlyFinds = computed(() => {
    const months: Record<string, number> = {};
    for (const f of this.findsSignal()) {
      const date = new Date(f.dateFound);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    }
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  });

  readonly valueByCategory = computed(() => {
    const values: Partial<Record<FindCategory, number>> = {};
    for (const f of this.findsSignal()) {
      values[f.category] = (values[f.category] || 0) + (f.estimatedValue || 0);
    }
    return Object.entries(values)
      .map(([key, value]) => ({
        category: key as FindCategory,
        label: CATEGORY_LABELS[key as FindCategory],
        value: value!,
      }))
      .sort((a, b) => b.value - a.value);
  });

  getById(id: string): DetectorFind | undefined {
    return this.findsSignal().find((f) => f.id === id);
  }

  add(find: Omit<DetectorFind, 'id'>): DetectorFind {
    const newFind: DetectorFind = { ...find, id: crypto.randomUUID() };
    this.findsSignal.update((items) => [...items, newFind]);
    this.saveToStorage();
    return newFind;
  }

  update(id: string, changes: Partial<DetectorFind>): void {
    this.findsSignal.update((items) =>
      items.map((f) => (f.id === id ? { ...f, ...changes } : f))
    );
    this.saveToStorage();
  }

  delete(id: string): void {
    this.findsSignal.update((items) => items.filter((f) => f.id !== id));
    this.saveToStorage();
  }

  private loadFromStorage(): DetectorFind[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.findsSignal()));
  }
}
