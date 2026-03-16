import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { ItemService } from '../../services/find.service';
import { AuthService } from '../../services/auth.service';
import { XpService } from '../../services/xp.service';
import {
  ItemCategory,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CATEGORY_XP,
} from '../../models/find.model';
import { CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';

Chart.register(...registerables);

const CHART_COLORS = [
  '#daa520', '#c0392b', '#2980b9', '#27ae60', '#8e44ad',
  '#e67e22', '#1abc9c', '#e74c3c', '#3498db', '#f39c12',
  '#9b59b6', '#2ecc71',
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, BaseChartDirective, CurrencyPipe, DecimalPipe, DatePipe],
  template: `
    <div class="dashboard">
      <!-- OSRS Skill Panel -->
      <div class="skill-panel osrs-panel">
        <div class="skill-header">
          <img src="img/spade.png" class="skill-icon-img" alt="Metal Detecting" />
          <div class="skill-title">
            <h2 class="osrs-heading">Metal Detecting</h2>
            <span class="skill-subtitle">Level {{ xp.currentLevel() }}</span>
          </div>
          <img src="img/king-sand-crab.png" class="skill-crab" alt="" />
        </div>
        <div class="xp-bar-container">
          <div class="xp-bar-bg">
            <div class="xp-bar-fill" [style.width.%]="xp.progressPercent()"></div>
          </div>
          <div class="xp-labels">
            @if (xp.isMaxLevel()) {
              <span class="xp-max">MAX LEVEL — 13,034,431 XP</span>
            } @else {
              <span>{{ xp.xpIntoCurrentLevel() | number }} / {{ xp.xpNeededForNextLevel() | number }} XP</span>
              <span>Next: Level {{ xp.currentLevel() + 1 }}</span>
            }
          </div>
        </div>
        <div class="xp-total">
          Total XP: <strong>{{ xp.totalXp() | number }}</strong>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="hero">
        <h1 class="osrs-heading">🌴 Your Detecting Stats 🐚</h1>
      </div>

      <div class="stats-grid">
        <div class="stat-card osrs-panel">
          <span class="stat-icon">🎯</span>
          <div class="stat-info">
            <span class="stat-value">{{ svc.totalItems() }}</span>
            <span class="stat-label">Total Items</span>
          </div>
        </div>
        <div class="stat-card osrs-panel gold-card">
          <span class="stat-icon">💰</span>
          <div class="stat-info">
            <span class="stat-value gp-text">{{ svc.totalValue() | currency }}</span>
            <span class="stat-label">Total Value</span>
          </div>
        </div>
        <div class="stat-card osrs-panel">
          <span class="stat-icon">🏆</span>
          <div class="stat-info">
            @if (svc.bestItem(); as best) {
              <span class="stat-value">{{ best.name }}</span>
              <span class="stat-label">Best Item ({{ best.estimatedValue | currency }})</span>
            } @else {
              <span class="stat-value">—</span>
              <span class="stat-label">Best Item</span>
            }
          </div>
        </div>
      </div>

      <!-- Category Breakdown: icons sorted by XP -->
      <div class="cat-breakdown osrs-panel">
        <h3>📦 Items by Category</h3>
        <div class="cat-grid">
          @for (cat of svc.categorySummary(); track cat.category) {
            <a [routerLink]="['/wiki']" [fragment]="cat.category" class="cat-item">
              <span class="cat-icon">{{ cat.icon }}</span>
              <span class="cat-name">{{ cat.label }}</span>
              <span class="cat-count">{{ cat.count }}</span>
              <span class="cat-xp">+{{ cat.xp }} xp</span>
              <span class="cat-rate">{{ cat.dropRate | number:'1.1-1' }}%</span>
            </a>
          }
        </div>
      </div>

      @if (svc.totalItems() === 0) {
        <div class="empty-state osrs-panel">
          <img src="img/bucket-of-sand.png" class="empty-img" alt="" />
          <h2>No items logged yet!</h2>
          <p>Grab your detector and start digging, adventurer!</p>
          @if (auth.isAdmin()) {
            <a routerLink="/add" class="btn-primary">⚔️ Log Your First Item</a>
          }
        </div>
      } @else {
        <div class="charts-grid">
          <div class="chart-card osrs-panel">
            <h3>📊 Items by Category</h3>
            <div class="chart-wrapper">
              <canvas baseChart
                [datasets]="categoryChartData().datasets"
                [labels]="categoryChartData().labels"
                [options]="doughnutOptions"
                type="doughnut">
              </canvas>
            </div>
          </div>
          <div class="chart-card osrs-panel wide">
            <h3>📈 Items Over Time</h3>
            <div class="chart-wrapper line">
              <canvas baseChart
                [datasets]="timelineChartData().datasets"
                [labels]="timelineChartData().labels"
                [options]="lineOptions"
                type="line">
              </canvas>
            </div>
          </div>
        </div>

        <div class="recent-section">
          <div class="section-header">
            <h3 class="osrs-heading" style="font-size:0.55rem">🦀 Recent Items</h3>
            <a routerLink="/items" class="view-all">View all →</a>
          </div>
          <div class="recent-grid">
            @for (item of svc.recentItems(); track item.id) {
              <a [routerLink]="['/items', item.id]" class="recent-card osrs-panel">
                <span class="recent-icon">{{ getCategoryIcon(item.category) }}</span>
                <div class="recent-info">
                  <span class="recent-name">{{ item.name }}</span>
                  <span class="recent-meta">
                    {{ item.dateFound | date:'mediumDate' }} · {{ getCategoryLabel(item.category) }}
                    · <span class="xp-inline">+{{ getCategoryXp(item.category) }} xp</span>
                  </span>
                </div>
                <span class="recent-value">{{ item.estimatedValue | currency }}</span>
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .dashboard { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }

    .skill-panel {
      padding: 1.25rem; margin-bottom: 1.5rem;
      background: linear-gradient(180deg, #3a3a2a 0%, #2a2a1a 100%) !important;
      border-color: #5a5a3a !important;
    }
    .skill-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.85rem; }
    .skill-icon-img { width: 48px; height: 48px; image-rendering: pixelated; }
    .skill-crab { width: 56px; height: 56px; image-rendering: pixelated; margin-left: auto; opacity: 0.8; }
    .skill-title h2 { font-size: 0.65rem; margin-bottom: 0.2rem; }
    .skill-subtitle { font-size: 1.1rem; color: var(--text-light); text-shadow: 1px 1px 0 #000; }
    .xp-bar-container { margin-bottom: 0.6rem; }
    .xp-bar-bg {
      height: 22px; background: #1a1a14;
      border: 2px solid #555540; border-bottom-color: #3a3a2a; border-right-color: #3a3a2a;
      overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
    }
    .xp-bar-fill {
      height: 100%;
      background: linear-gradient(180deg, #00cc00 0%, #009900 50%, #006600 100%);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.2); transition: width 0.5s ease;
    }
    .xp-labels { display: flex; justify-content: space-between; font-size: 0.85rem; color: #b0b090; margin-top: 0.3rem; }
    .xp-max { color: var(--gold); font-weight: 700; }
    .xp-total { font-size: 0.9rem; color: #b0b090; }
    .xp-total strong { color: var(--osrs-yellow); }

    .hero { margin-bottom: 1rem; text-align: center; }
    .hero h1 { font-size: 0.75rem; }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.85rem; margin-bottom: 1rem;
    }
    .stat-card { padding: 1rem; display: flex; align-items: center; gap: 0.85rem; transition: transform 0.15s; }
    .stat-card:hover { transform: translateY(-2px); }
    .gold-card { border-color: var(--gold-dark) !important; }
    .stat-icon { font-size: 1.75rem; }
    .stat-info { display: flex; flex-direction: column; min-width: 0; }
    .stat-value { font-size: 1.3rem; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gp-text { color: var(--gold-dark); text-shadow: 1px 1px 0 rgba(0,0,0,0.15); }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); }

    /* Category breakdown */
    .cat-breakdown { padding: 1rem; margin-bottom: 1.5rem; }
    .cat-breakdown h3 {
      font-size: 1rem; margin-bottom: 0.75rem; color: var(--text);
      border-bottom: 2px solid var(--border-light); padding-bottom: 0.35rem;
    }
    .cat-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.5rem;
    }
    .cat-item {
      display: grid; grid-template-columns: auto 1fr auto auto auto;
      align-items: center; gap: 0.4rem;
      padding: 0.5rem 0.65rem;
      background: rgba(0,0,0,0.04);
      border: 1px solid var(--border-light);
      text-decoration: none; color: var(--text);
      transition: background 0.15s;
    }
    .cat-item:hover { background: rgba(0,0,0,0.08); }
    .cat-icon { font-size: 1.2rem; }
    .cat-name { font-weight: 600; font-size: 0.9rem; }
    .cat-count {
      font-weight: 700; font-size: 0.85rem;
      background: var(--border); color: var(--text-light);
      padding: 0.1rem 0.35rem; min-width: 24px; text-align: center;
    }
    .cat-xp { font-size: 0.75rem; color: #1a7a1a; font-weight: 700; }
    .cat-rate { font-size: 0.7rem; color: var(--text-muted); }

    .empty-state { text-align: center; padding: 3rem 2rem; }
    .empty-img { width: 64px; height: 64px; image-rendering: pixelated; margin-bottom: 0.75rem; }
    .empty-state h2 { color: var(--text); margin-bottom: 0.4rem; font-size: 1.3rem; }
    .empty-state p { color: var(--text-muted); margin-bottom: 1.25rem; }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(180deg, #4caf50 0%, #2d8c3e 100%);
      color: var(--text-light); padding: 0.6rem 1.5rem;
      border: 2px solid #1a5c1a; border-top-color: #6fcf6f; border-left-color: #6fcf6f;
      text-decoration: none; font-weight: 600; font-family: inherit; font-size: 1rem;
      box-shadow: 2px 2px 0 rgba(0,0,0,0.3); text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
    }
    .btn-primary:hover { filter: brightness(1.1); }

    .charts-grid {
      display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 0.85rem; margin-bottom: 1.5rem;
    }
    .chart-card { padding: 1rem; }
    .chart-card.wide { grid-column: span 2; }
    .chart-card h3 { font-size: 1rem; margin-bottom: 0.75rem; color: var(--text); border-bottom: 2px solid var(--border-light); padding-bottom: 0.4rem; }
    .chart-wrapper { position: relative; height: 250px; }
    .chart-wrapper.line { height: 200px; }

    .recent-section { margin-top: 0.75rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .view-all {
      color: var(--text); text-decoration: none; font-size: 0.95rem;
      padding: 0.25rem 0.6rem; border: 2px solid var(--border-light); background: var(--surface);
    }
    .view-all:hover { background: var(--surface-hover); }
    .recent-grid { display: flex; flex-direction: column; gap: 0.5rem; }
    .recent-card {
      display: flex; align-items: center; gap: 0.85rem;
      padding: 0.75rem 1rem; text-decoration: none; color: var(--text); transition: transform 0.15s;
    }
    .recent-card:hover { transform: translateX(3px); }
    .recent-icon { font-size: 1.3rem; }
    .recent-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .recent-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .recent-meta { font-size: 0.85rem; color: var(--text-muted); }
    .xp-inline { color: var(--osrs-green); font-weight: 700; }
    .recent-value { font-weight: 700; color: var(--gold-dark); white-space: nowrap; }

    @media (max-width: 768px) {
      .dashboard { padding: 1rem; }
      .charts-grid { grid-template-columns: 1fr; }
      .chart-card.wide { grid-column: span 1; }
      .hero h1 { font-size: 0.6rem; }
      .cat-grid { grid-template-columns: 1fr; }
    }
  `,
})
export class DashboardComponent {
  protected readonly svc = inject(ItemService);
  protected readonly auth = inject(AuthService);
  protected readonly xp = inject(XpService);

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#2c1810', padding: 12, font: { size: 13, family: 'VT323' } } } },
  };
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: '#5e4025', font: { family: 'VT323' } }, grid: { color: 'rgba(74,42,10,0.15)' } },
      y: { beginAtZero: true, ticks: { color: '#5e4025', stepSize: 1, font: { family: 'VT323' } }, grid: { color: 'rgba(74,42,10,0.15)' } },
    },
    plugins: { legend: { display: false } },
  };

  categoryChartData = computed(() => {
    const data = this.svc.categoryBreakdown();
    return {
      labels: data.map((d) => d.label),
      datasets: [{ data: data.map((d) => d.count), backgroundColor: CHART_COLORS.slice(0, data.length), borderWidth: 2, borderColor: '#4a2a0a' }],
    };
  });
  timelineChartData = computed(() => {
    const data = this.svc.monthlyItems();
    return {
      labels: data.map((d) => d.month),
      datasets: [{ data: data.map((d) => d.count), borderColor: '#daa520', backgroundColor: 'rgba(218,165,32,0.2)', fill: true, tension: 0.3, pointBackgroundColor: '#daa520', pointBorderColor: '#4a2a0a', pointBorderWidth: 2 }],
    };
  });

  getCategoryIcon(cat: ItemCategory): string { return CATEGORY_ICONS[cat] ?? '❓'; }
  getCategoryLabel(cat: ItemCategory): string { return CATEGORY_LABELS[cat] ?? cat; }
  getCategoryXp(cat: ItemCategory): number { return CATEGORY_XP[cat] ?? 0; }
}
