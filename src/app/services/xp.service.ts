import { Injectable, computed, inject } from '@angular/core';
import { ItemService } from './find.service';
import { CATEGORY_XP } from '../models/find.model';

const MAX_LEVEL = 99;

function buildXpTable(): number[] {
  const table = [0];
  let cumulative = 0;
  for (let lvl = 1; lvl < MAX_LEVEL; lvl++) {
    cumulative += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
    table.push(Math.floor(cumulative / 4));
  }
  return table;
}

const XP_TABLE = buildXpTable();

@Injectable({ providedIn: 'root' })
export class XpService {
  private itemService = inject(ItemService);

  readonly totalXp = computed(() =>
    this.itemService.items().reduce(
      (sum, f) => sum + (CATEGORY_XP[f.category] ?? 0),
      0
    )
  );

  readonly currentLevel = computed(() => {
    const xp = this.totalXp();
    for (let i = XP_TABLE.length - 1; i >= 0; i--) {
      if (xp >= XP_TABLE[i]) return i + 1;
    }
    return 1;
  });

  readonly xpForCurrentLevel = computed(() => XP_TABLE[this.currentLevel() - 1] ?? 0);

  readonly xpForNextLevel = computed(() => {
    const lvl = this.currentLevel();
    if (lvl >= MAX_LEVEL) return XP_TABLE[MAX_LEVEL - 1];
    return XP_TABLE[lvl] ?? 0;
  });

  readonly xpIntoCurrentLevel = computed(() => this.totalXp() - this.xpForCurrentLevel());
  readonly xpNeededForNextLevel = computed(() => this.xpForNextLevel() - this.xpForCurrentLevel());

  readonly progressPercent = computed(() => {
    if (this.currentLevel() >= MAX_LEVEL) return 100;
    const needed = this.xpNeededForNextLevel();
    if (needed <= 0) return 100;
    return Math.min(100, (this.xpIntoCurrentLevel() / needed) * 100);
  });

  readonly isMaxLevel = computed(() => this.currentLevel() >= MAX_LEVEL);
}
