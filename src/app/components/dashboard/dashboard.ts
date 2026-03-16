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
import { CurrencyPipe, DecimalPipe } from '@angular/common';

Chart.register(...registerables);

const CHART_COLORS = [
  '#daa520', '#c0392b', '#2980b9', '#27ae60', '#8e44ad',
  '#e67e22', '#1abc9c', '#e74c3c', '#3498db', '#f39c12',
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, BaseChartDirective, CurrencyPipe, DecimalPipe],
  template: `
    <div class="page">
      <!-- Hero banner like OSRS homepage -->
      <div class="hero">
        <div class="hero-inner">
          <h1 class="osrs-heading-gold">DetectorLog</h1>
          <p class="hero-sub">Track your metal detecting adventures. Gain XP. Level up.</p>
          <div class="hero-stat">
            There are currently <strong>{{ svc.totalItems() }}</strong> items logged!
          </div>
        </div>
      </div>

      <div class="content">
        <div class="main-grid">
          <!-- Left column: News / Stats -->
          <div class="col-main">
            <!-- Skill panel (highscores style) -->
            <section class="section-panel">
              <div class="panel-header">
                <h2>Metal Detecting — Highscores</h2>
              </div>
              <div class="panel-body">
                <div class="skill-row">
                  <img src="img/spade.png" class="skill-icon" alt="" />
                  <div class="skill-info">
                    <div class="skill-name">Metal Detecting</div>
                    <div class="skill-level">Level {{ xp.currentLevel() }}</div>
                  </div>
                  <div class="skill-xp">
                    <span class="xp-val">{{ xp.totalXp() | number }} XP</span>
                  </div>
                </div>
                <div class="xp-bar-wrap">
                  <div class="xp-bar-bg">
                    <div class="xp-bar-fill" [style.width.%]="xp.progressPercent()"></div>
                  </div>
                  <div class="xp-bar-labels">
                    @if (xp.isMaxLevel()) {
                      <span class="xp-max">MAX LEVEL</span>
                    } @else {
                      <span>{{ xp.xpIntoCurrentLevel() | number }} / {{ xp.xpNeededForNextLevel() | number }}</span>
                      <span>Next: Lvl {{ xp.currentLevel() + 1 }}</span>
                    }
                  </div>
                </div>
              </div>
            </section>

            <!-- Category breakdown (highscores table) -->
            <section class="section-panel">
              <div class="panel-header">
                <h2>Category Breakdown</h2>
              </div>
              <div class="panel-body no-pad">
                <table class="hs-table">
                  <thead>
                    <tr>
                      <th style="width:40px"></th>
                      <th>Category</th>
                      <th>Found</th>
                      <th>XP Each</th>
                      <th>Drop Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (cat of svc.categorySummary(); track cat.category) {
                      <tr>
                        <td style="text-align:center;font-size:1.15rem">{{ cat.icon }}</td>
                        <td><a [routerLink]="['/wiki']" [fragment]="cat.category">{{ cat.label }}</a></td>
                        <td><strong>{{ cat.count }}</strong></td>
                        <td class="xp-cell">+{{ cat.xp }}</td>
                        <td>{{ cat.dropRate | number:'1.1-1' }}%</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Stats summary -->
            <section class="section-panel">
              <div class="panel-header">
                <h2>Your Stats</h2>
              </div>
              <div class="panel-body">
                <div class="stat-row">
                  <div class="stat-item">
                    <span class="stat-label">Total Items</span>
                    <span class="stat-value">{{ svc.totalItems() }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Total Value</span>
                    <span class="stat-value gold">{{ svc.totalValue() | currency }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Best Item</span>
                    @if (svc.bestItem(); as best) {
                      <span class="stat-value">{{ best.name }}</span>
                    } @else {
                      <span class="stat-value muted">—</span>
                    }
                  </div>
                </div>
              </div>
            </section>

            @if (svc.totalItems() === 0) {
              <section class="section-panel">
                <div class="panel-body" style="text-align:center;padding:2rem">
                  <img src="img/bucket-of-sand.png" class="empty-img" alt="" />
                  <h3 style="margin:0.5rem 0 0.25rem">No items logged yet!</h3>
                  <p style="color:var(--gray-500);margin-bottom:1rem">Grab your detector and start digging.</p>
                  @if (auth.isAdmin()) {
                    <a routerLink="/add" class="osrs-btn osrs-btn-primary">Log Your First Item</a>
                  }
                </div>
              </section>
            }
          </div>

          <!-- Right column: Charts & Recent -->
          <div class="col-side">
            @if (svc.totalItems() > 0) {
              <section class="section-panel">
                <div class="panel-header"><h2>Items by Category</h2></div>
                <div class="panel-body">
                  <div class="chart-wrap donut">
                    <canvas baseChart
                      [datasets]="categoryChartData().datasets"
                      [labels]="categoryChartData().labels"
                      [options]="doughnutOptions"
                      type="doughnut">
                    </canvas>
                  </div>
                </div>
              </section>

              <section class="section-panel">
                <div class="panel-header"><h2>Items Over Time</h2></div>
                <div class="panel-body">
                  <div class="chart-wrap line">
                    <canvas baseChart
                      [datasets]="timelineChartData().datasets"
                      [labels]="timelineChartData().labels"
                      [options]="lineOptions"
                      type="line">
                    </canvas>
                  </div>
                </div>
              </section>

              <section class="section-panel">
                <div class="panel-header">
                  <h2>Recent Items</h2>
                  <a routerLink="/items" class="panel-link">View all →</a>
                </div>
                <div class="panel-body no-pad">
                  <table class="hs-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Value</th>
                        <th>XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of svc.recentItems(); track item.id) {
                        <tr>
                          <td style="text-align:center;font-size:1.1rem">{{ getCategoryIcon(item.category) }}</td>
                          <td><a [routerLink]="['/items', item.id]">{{ item.name }}</a></td>
                          <td>{{ item.estimatedValue | currency }}</td>
                          <td class="xp-cell">+{{ getCategoryXp(item.category) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </section>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .page { position: relative; z-index: 1; }

    /* OSRS Homepage hero */
    .hero {
      background: linear-gradient(180deg, #2a1f14, #18120a);
      border-bottom: 3px solid #0d0a06;
      padding: 2rem 1rem;
      text-align: center;
    }
    .hero-inner { max-width: 700px; margin: 0 auto; }
    .hero h1 { font-size: 2rem; margin-bottom: 0.35rem; }
    .hero-sub {
      font-size: 1rem; color: #b79d7e; margin-bottom: 0.75rem;
    }
    .hero-stat {
      font-size: 0.875rem; color: #94866d;
    }
    .hero-stat strong { color: #ffd700; }

    /* Content */
    .content {
      max-width: 1200px; margin: 0 auto;
      padding: 1.25rem 1rem 3rem;
    }
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1rem;
      align-items: start;
    }

    /* Section panels (OSRS style bordered boxes) */
    .section-panel {
      background: var(--body-main);
      border: 2px solid var(--body-border);
      margin-bottom: 1rem;
    }
    .panel-header {
      background: linear-gradient(180deg, #605443, #3c352a);
      padding: 0.5rem 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .panel-header h2 {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 700;
      color: #e2dbc8;
      margin: 0;
    }
    .panel-link {
      font-size: 0.8rem;
      color: #c0a886;
    }
    .panel-link:hover { color: #ffd700; }
    .panel-body { padding: 0.85rem; }
    .panel-body.no-pad { padding: 0; }

    /* Skill row */
    .skill-row {
      display: flex; align-items: center; gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .skill-icon { width: 36px; height: 36px; image-rendering: pixelated; }
    .skill-info { flex: 1; }
    .skill-name {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1rem;
      color: var(--btn-dark);
    }
    .skill-level { font-size: 0.85rem; color: var(--gray-500); }
    .skill-xp { text-align: right; }
    .xp-val { font-weight: 700; color: var(--brown); font-size: 0.95rem; }

    /* XP bar */
    .xp-bar-wrap { margin-bottom: 0; }
    .xp-bar-bg {
      height: 18px;
      background: #1b1612;
      border: 1px solid #3e362f;
      overflow: hidden;
    }
    .xp-bar-fill {
      height: 100%;
      background: linear-gradient(180deg, #00cc00, #009900, #006600);
      transition: width 0.5s;
    }
    .xp-bar-labels {
      display: flex; justify-content: space-between;
      font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;
    }
    .xp-max { color: #daa520; font-weight: 700; }

    /* XP cell in table */
    .xp-cell { color: #2e5e05; font-weight: 700; }

    /* Stats row */
    .stat-row {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;
    }
    .stat-item { text-align: center; }
    .stat-label {
      display: block; font-size: 0.8rem; color: var(--gray-500);
      margin-bottom: 0.15rem;
    }
    .stat-value {
      display: block; font-family: var(--font-heading);
      font-size: 1.2rem; font-weight: 700; color: var(--btn-dark);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .stat-value.gold { color: #daa520; }
    .stat-value.muted { color: var(--gray-500); }

    /* Empty state */
    .empty-img { width: 48px; height: 48px; image-rendering: pixelated; }

    /* Charts */
    .chart-wrap { position: relative; }
    .chart-wrap.donut { height: 220px; }
    .chart-wrap.line { height: 180px; }

    @media (max-width: 900px) {
      .main-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .hero h1 { font-size: 1.5rem; }
      .stat-row { grid-template-columns: 1fr; gap: 0.5rem; }
      .content { padding: 1rem 0.75rem 2rem; }
    }
  `,
})
export class DashboardComponent {
  protected readonly svc = inject(ItemService);
  protected readonly auth = inject(AuthService);
  protected readonly xp = inject(XpService);

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#333', padding: 10, font: { size: 12, family: 'IBM Plex Sans' } },
      },
    },
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: '#777', font: { family: 'IBM Plex Sans', size: 11 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
      y: { beginAtZero: true, ticks: { color: '#777', stepSize: 1, font: { family: 'IBM Plex Sans', size: 11 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
    },
    plugins: { legend: { display: false } },
  };

  categoryChartData = computed(() => {
    const data = this.svc.categoryBreakdown();
    return {
      labels: data.map((d) => d.label),
      datasets: [{ data: data.map((d) => d.count), backgroundColor: CHART_COLORS.slice(0, data.length), borderWidth: 1, borderColor: '#94866d' }],
    };
  });

  timelineChartData = computed(() => {
    const data = this.svc.monthlyItems();
    return {
      labels: data.map((d) => d.month),
      datasets: [{
        data: data.map((d) => d.count),
        borderColor: '#936039', backgroundColor: 'rgba(147,96,57,0.15)',
        fill: true, tension: 0.3,
        pointBackgroundColor: '#936039', pointBorderColor: '#fff', pointBorderWidth: 1,
      }],
    };
  });

  getCategoryIcon(cat: ItemCategory): string { return CATEGORY_ICONS[cat] ?? '❓'; }
  getCategoryXp(cat: ItemCategory): number { return CATEGORY_XP[cat] ?? 0; }
}
