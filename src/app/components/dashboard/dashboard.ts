import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { FindService } from '../../services/find.service';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  MATERIAL_LABELS,
  FindCategory,
} from '../../models/find.model';
import { CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';

Chart.register(...registerables);

const CHART_COLORS = [
  '#d4a017', '#c0392b', '#2980b9', '#27ae60', '#8e44ad',
  '#e67e22', '#1abc9c', '#e74c3c', '#3498db', '#f39c12',
  '#9b59b6', '#2ecc71',
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, BaseChartDirective, CurrencyPipe, DecimalPipe, DatePipe],
  template: `
    <div class="dashboard">
      <div class="hero">
        <h1>Your Detecting Stats</h1>
        <p>Track every find, watch your collection grow.</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">🎯</span>
          <div class="stat-info">
            <span class="stat-value">{{ findService.totalFinds() }}</span>
            <span class="stat-label">Total Finds</span>
          </div>
        </div>
        <div class="stat-card gold">
          <span class="stat-icon">💰</span>
          <div class="stat-info">
            <span class="stat-value">{{ findService.totalValue() | currency }}</span>
            <span class="stat-label">Total Value</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📏</span>
          <div class="stat-info">
            <span class="stat-value">{{ findService.averageDepth() | number:'1.1-1' }}"</span>
            <span class="stat-label">Avg Depth</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏆</span>
          <div class="stat-info">
            @if (findService.bestFind(); as best) {
              <span class="stat-value">{{ best.name }}</span>
              <span class="stat-label">Best Find ({{ best.estimatedValue | currency }})</span>
            } @else {
              <span class="stat-value">—</span>
              <span class="stat-label">Best Find</span>
            }
          </div>
        </div>
      </div>

      @if (findService.totalFinds() === 0) {
        <div class="empty-state">
          <span class="empty-icon">⛏️</span>
          <h2>No finds logged yet</h2>
          <p>Head out with your detector and log your first discovery!</p>
          <a routerLink="/add" class="btn-primary">+ Log Your First Find</a>
        </div>
      } @else {
        <div class="charts-grid">
          <div class="chart-card">
            <h3>Finds by Category</h3>
            <div class="chart-wrapper">
              <canvas baseChart
                [datasets]="categoryChartData().datasets"
                [labels]="categoryChartData().labels"
                [options]="doughnutOptions"
                type="doughnut">
              </canvas>
            </div>
          </div>
          <div class="chart-card">
            <h3>Finds by Material</h3>
            <div class="chart-wrapper">
              <canvas baseChart
                [datasets]="materialChartData().datasets"
                [labels]="materialChartData().labels"
                [options]="doughnutOptions"
                type="doughnut">
              </canvas>
            </div>
          </div>
          <div class="chart-card wide">
            <h3>Finds Over Time</h3>
            <div class="chart-wrapper line">
              <canvas baseChart
                [datasets]="timelineChartData().datasets"
                [labels]="timelineChartData().labels"
                [options]="lineOptions"
                type="line">
              </canvas>
            </div>
          </div>
          <div class="chart-card wide">
            <h3>Value by Category</h3>
            <div class="chart-wrapper line">
              <canvas baseChart
                [datasets]="valueByCategoryData().datasets"
                [labels]="valueByCategoryData().labels"
                [options]="barOptions"
                type="bar">
              </canvas>
            </div>
          </div>
        </div>

        <div class="recent-section">
          <div class="section-header">
            <h3>Recent Finds</h3>
            <a routerLink="/finds" class="view-all">View all →</a>
          </div>
          <div class="recent-grid">
            @for (find of findService.recentFinds(); track find.id) {
              <a [routerLink]="['/finds', find.id]" class="recent-card">
                <span class="recent-icon">{{ getCategoryIcon(find.category) }}</span>
                <div class="recent-info">
                  <span class="recent-name">{{ find.name }}</span>
                  <span class="recent-meta">
                    {{ find.dateFound | date:'mediumDate' }} · {{ getCategoryLabel(find.category) }}
                  </span>
                </div>
                <span class="recent-value">{{ find.estimatedValue | currency }}</span>
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .dashboard { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .hero { margin-bottom: 2rem; }
    .hero h1 {
      font-size: 2rem;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .hero p { color: var(--text-muted); margin-top: 0.25rem; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
    .stat-card.gold { border-color: var(--gold-dark); }
    .stat-icon { font-size: 2rem; }
    .stat-info { display: flex; flex-direction: column; min-width: 0; }
    .stat-value {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--surface);
      border: 1px dashed var(--border);
      border-radius: 16px;
    }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .empty-state h2 { margin-bottom: 0.5rem; }
    .empty-state p { color: var(--text-muted); margin-bottom: 1.5rem; }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, var(--gold), var(--gold-dark));
      color: var(--bg);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .chart-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .chart-card.wide { grid-column: span 2; }
    .chart-card h3 { font-size: 1rem; margin-bottom: 1rem; color: var(--text-muted); }
    .chart-wrapper { position: relative; height: 250px; }
    .chart-wrapper.line { height: 200px; }

    .recent-section { margin-top: 1rem; }
    .section-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1rem;
    }
    .section-header h3 { font-size: 1.1rem; }
    .view-all { color: var(--gold); text-decoration: none; font-size: 0.9rem; }

    .recent-grid { display: flex; flex-direction: column; gap: 0.5rem; }
    .recent-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 1.25rem;
      text-decoration: none;
      color: var(--text);
      transition: border-color 0.2s, transform 0.2s;
    }
    .recent-card:hover { border-color: var(--gold-dark); transform: translateX(4px); }
    .recent-icon { font-size: 1.5rem; }
    .recent-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .recent-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .recent-meta { font-size: 0.8rem; color: var(--text-muted); }
    .recent-value { font-weight: 700; color: var(--gold); white-space: nowrap; }

    @media (max-width: 768px) {
      .dashboard { padding: 1rem; }
      .charts-grid { grid-template-columns: 1fr; }
      .chart-card.wide { grid-column: span 1; }
      .hero h1 { font-size: 1.5rem; }
    }
  `,
})
export class DashboardComponent {
  protected readonly findService = inject(FindService);

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#a0a0a0', padding: 12, font: { size: 12 } } },
    },
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: '#666' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { beginAtZero: true, ticks: { color: '#666', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
    plugins: { legend: { display: false } },
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, ticks: { color: '#666', callback: (v) => '$' + v }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#a0a0a0' }, grid: { display: false } },
    },
    plugins: { legend: { display: false } },
  };

  categoryChartData = computed(() => {
    const data = this.findService.categoryBreakdown();
    return {
      labels: data.map((d) => d.label),
      datasets: [{ data: data.map((d) => d.count), backgroundColor: CHART_COLORS.slice(0, data.length), borderWidth: 0 }],
    };
  });

  materialChartData = computed(() => {
    const data = this.findService.materialBreakdown();
    return {
      labels: data.map((d) => d.label),
      datasets: [{ data: data.map((d) => d.count), backgroundColor: CHART_COLORS.slice(0, data.length), borderWidth: 0 }],
    };
  });

  timelineChartData = computed(() => {
    const data = this.findService.monthlyFinds();
    return {
      labels: data.map((d) => d.month),
      datasets: [{
        data: data.map((d) => d.count),
        borderColor: '#d4a017',
        backgroundColor: 'rgba(212,160,23,0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#d4a017',
      }],
    };
  });

  valueByCategoryData = computed(() => {
    const data = this.findService.valueByCategory();
    return {
      labels: data.map((d) => d.label),
      datasets: [{
        data: data.map((d) => d.value),
        backgroundColor: CHART_COLORS.slice(0, data.length),
        borderWidth: 0,
        borderRadius: 4,
      }],
    };
  });

  getCategoryIcon(cat: FindCategory): string {
    return CATEGORY_ICONS[cat] ?? '❓';
  }

  getCategoryLabel(cat: FindCategory): string {
    return CATEGORY_LABELS[cat] ?? cat;
  }
}
