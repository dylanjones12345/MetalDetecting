import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FindService } from '../../services/find.service';
import {
  DetectorFind,
  FindCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  MATERIAL_LABELS,
  CONDITION_LABELS,
} from '../../models/find.model';

@Component({
  selector: 'app-find-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="list-page">
      <div class="list-header">
        <div>
          <h1>My Finds</h1>
          <p>{{ findService.totalFinds() }} items in your collection</p>
        </div>
        <a routerLink="/add" class="btn-primary">+ Log Find</a>
      </div>

      <div class="filters">
        <input type="text" [(ngModel)]="searchQuery" placeholder="Search finds..."
          class="search-input" (ngModelChange)="onFilterChange()" />
        <select [(ngModel)]="categoryFilter" (ngModelChange)="onFilterChange()">
          <option value="">All Categories</option>
          @for (opt of categoryOptions; track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
        <select [(ngModel)]="sortBy" (ngModelChange)="onFilterChange()">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="value-desc">Highest Value</option>
          <option value="value-asc">Lowest Value</option>
          <option value="name-asc">Name A–Z</option>
        </select>
      </div>

      @if (filteredFinds().length === 0) {
        <div class="empty">
          <p>No finds match your filters.</p>
        </div>
      } @else {
        <div class="finds-grid">
          @for (find of filteredFinds(); track find.id) {
            <a [routerLink]="['/finds', find.id]" class="find-card">
              @if (find.imageUrl) {
                <div class="card-image" [style.background-image]="'url(' + find.imageUrl + ')'"></div>
              } @else {
                <div class="card-image placeholder">
                  <span>{{ getCategoryIcon(find.category) }}</span>
                </div>
              }
              <div class="card-body">
                <div class="card-top">
                  <span class="card-category">{{ getCategoryLabel(find.category) }}</span>
                  <span class="card-condition" [attr.data-condition]="find.condition">
                    {{ getConditionLabel(find.condition) }}
                  </span>
                </div>
                <h3 class="card-name">{{ find.name }}</h3>
                <div class="card-meta">
                  <span>{{ find.dateFound | date:'mediumDate' }}</span>
                  <span>{{ getMaterialLabel(find.material) }}</span>
                </div>
                <div class="card-bottom">
                  <span class="card-value">{{ find.estimatedValue | currency }}</span>
                  @if (find.depth) {
                    <span class="card-depth">{{ find.depth }}{{ find.depthUnit }} deep</span>
                  }
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .list-page { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .list-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
    }
    .list-header h1 {
      font-size: 1.75rem;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .list-header p { color: var(--text-muted); margin-top: 0.25rem; }
    .btn-primary {
      display: inline-block; background: linear-gradient(135deg, var(--gold), var(--gold-dark));
      color: var(--bg); padding: 0.65rem 1.25rem; border-radius: 8px;
      text-decoration: none; font-weight: 600; transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }

    .filters {
      display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;
    }
    .search-input {
      flex: 1; min-width: 200px;
      background: var(--surface); border: 1px solid var(--border); color: var(--text);
      padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.9rem;
    }
    .search-input:focus { outline: none; border-color: var(--gold); }
    .filters select {
      background: var(--surface); border: 1px solid var(--border); color: var(--text);
      padding: 0.6rem 0.85rem; border-radius: 8px; font-size: 0.9rem;
    }
    .filters select:focus { outline: none; border-color: var(--gold); }

    .empty {
      text-align: center; padding: 3rem; color: var(--text-muted);
      background: var(--surface); border-radius: 12px; border: 1px dashed var(--border);
    }

    .finds-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    .find-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      text-decoration: none;
      color: var(--text);
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .find-card:hover {
      transform: translateY(-3px);
      border-color: var(--gold-dark);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }

    .card-image {
      height: 160px;
      background-size: cover; background-position: center;
      background-color: var(--surface-hover);
    }
    .card-image.placeholder {
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem;
    }

    .card-body { padding: 1rem; }
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .card-category {
      font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
      color: var(--gold); letter-spacing: 0.5px;
    }
    .card-condition {
      font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 20px;
      font-weight: 600;
    }
    .card-condition[data-condition="excellent"] { background: rgba(46,204,113,0.15); color: #2ecc71; }
    .card-condition[data-condition="good"] { background: rgba(52,152,219,0.15); color: #3498db; }
    .card-condition[data-condition="fair"] { background: rgba(241,196,15,0.15); color: #f1c40f; }
    .card-condition[data-condition="poor"] { background: rgba(231,76,60,0.15); color: #e74c3c; }

    .card-name {
      font-size: 1.05rem; font-weight: 600; margin-bottom: 0.5rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .card-meta {
      display: flex; gap: 0.75rem;
      font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;
    }
    .card-bottom { display: flex; justify-content: space-between; align-items: center; }
    .card-value { font-weight: 700; color: var(--gold); font-size: 1.05rem; }
    .card-depth { font-size: 0.8rem; color: var(--text-muted); }

    @media (max-width: 600px) {
      .list-page { padding: 1rem; }
      .finds-grid { grid-template-columns: 1fr; }
    }
  `,
})
export class FindListComponent {
  protected readonly findService = inject(FindService);

  searchQuery = '';
  categoryFilter = '';
  sortBy = 'date-desc';

  private filterTrigger = signal(0);

  categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  filteredFinds = computed(() => {
    this.filterTrigger();
    let items = [...this.findService.finds()];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q) ||
          f.notes.toLowerCase().includes(q)
      );
    }
    if (this.categoryFilter) {
      items = items.filter((f) => f.category === this.categoryFilter);
    }

    switch (this.sortBy) {
      case 'date-desc': items.sort((a, b) => b.dateFound.localeCompare(a.dateFound)); break;
      case 'date-asc': items.sort((a, b) => a.dateFound.localeCompare(b.dateFound)); break;
      case 'value-desc': items.sort((a, b) => b.estimatedValue - a.estimatedValue); break;
      case 'value-asc': items.sort((a, b) => a.estimatedValue - b.estimatedValue); break;
      case 'name-asc': items.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return items;
  });

  onFilterChange() {
    this.filterTrigger.update((v) => v + 1);
  }

  getCategoryIcon(cat: FindCategory) { return CATEGORY_ICONS[cat] ?? '❓'; }
  getCategoryLabel(cat: string) { return CATEGORY_LABELS[cat as FindCategory] ?? cat; }
  getMaterialLabel(mat: string) { return (MATERIAL_LABELS as Record<string, string>)[mat] ?? mat; }
  getConditionLabel(cond: string) { return (CONDITION_LABELS as Record<string, string>)[cond] ?? cond; }
}
