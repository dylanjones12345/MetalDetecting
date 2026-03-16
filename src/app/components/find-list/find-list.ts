import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ItemService } from '../../services/find.service';
import { AuthService } from '../../services/auth.service';
import {
  ItemCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_XP,
  CONDITION_LABELS,
  TONE_LABELS,
} from '../../models/find.model';

@Component({
  selector: 'app-find-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    <div class="list-page">
      <div class="list-header">
        <div>
          <h1 class="osrs-heading">🎒 My Items</h1>
          <p>{{ svc.totalItems() }} items in your collection</p>
        </div>
        @if (auth.isAdmin()) {
          <a routerLink="/add" class="btn-primary">⚔️ Log Item</a>
        }
      </div>

      <div class="filters osrs-panel">
        <input type="text" [(ngModel)]="searchQuery" placeholder="🔍 Search items..."
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

      @if (filteredItems().length === 0) {
        <div class="empty osrs-panel"><p>No items match your filters.</p></div>
      } @else {
        <div class="finds-grid">
          @for (item of filteredItems(); track item.id) {
            <a [routerLink]="['/items', item.id]" class="find-card osrs-panel">
              @if (item.imageUrl) {
                <div class="card-image" [style.background-image]="'url(' + item.imageUrl + ')'"></div>
              } @else {
                <div class="card-image placeholder">
                  <span>{{ getCategoryIcon(item.category) }}</span>
                </div>
              }
              <div class="card-body">
                <div class="card-top">
                  <span class="card-category">{{ getCategoryLabel(item.category) }}</span>
                  <span class="card-xp">+{{ getCategoryXp(item.category) }} xp</span>
                </div>
                <h3 class="card-name">{{ item.name }}</h3>
                <div class="card-meta">
                  <span>{{ item.dateFound | date:'mediumDate' }}</span>
                  @if (item.tone) {
                    <span>{{ getToneLabel(item.tone) }}</span>
                  }
                </div>
                <div class="card-bottom">
                  <span class="card-value">{{ item.estimatedValue | currency }}</span>
                  <span class="card-rate">{{ svc.getDropRate(item.category) | number:'1.1-1' }}%</span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .list-page { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
    .list-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
    .list-header h1 { font-size: 0.75rem; margin-bottom: 0.3rem; }
    .list-header p { color: var(--text-muted); }
    .btn-primary {
      display: inline-block; background: linear-gradient(180deg, #4caf50 0%, #2d8c3e 100%);
      color: var(--text-light); padding: 0.5rem 1.1rem;
      border: 2px solid #1a5c1a; border-top-color: #6fcf6f; border-left-color: #6fcf6f;
      text-decoration: none; font-weight: 600; font-family: inherit; font-size: 1rem;
      box-shadow: 2px 2px 0 rgba(0,0,0,0.3); text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
    }
    .btn-primary:hover { filter: brightness(1.1); }
    .filters { display: flex; gap: 0.6rem; margin-bottom: 1rem; flex-wrap: wrap; padding: 0.75rem; }
    .search-input { flex: 1; min-width: 180px; }
    .filters input, .filters select {
      background: var(--surface-light); border: 2px solid var(--border); border-bottom-color: var(--border-light); border-right-color: var(--border-light);
      color: var(--text); padding: 0.45rem 0.7rem; font-size: 0.95rem; font-family: inherit; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.15);
    }
    .filters input:focus, .filters select:focus { outline: none; border-color: var(--gold-dark); }
    .empty { text-align: center; padding: 2.5rem; color: var(--text-muted); }
    .finds-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 0.85rem; }
    .find-card { overflow: hidden; text-decoration: none; color: var(--text); transition: transform 0.15s; padding: 0 !important; }
    .find-card:hover { transform: translateY(-3px); }
    .card-image { height: 150px; background-size: cover; background-position: center; background-color: var(--surface-dark); border-bottom: 2px solid var(--border); }
    .card-image.placeholder { display: flex; align-items: center; justify-content: center; font-size: 2.75rem; background: linear-gradient(135deg, var(--surface-dark), var(--surface)); }
    .card-body { padding: 0.85rem; }
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
    .card-category { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--gold-dark); letter-spacing: 0.5px; }
    .card-xp { font-size: 0.75rem; font-weight: 700; color: #00cc00; background: rgba(0,0,0,0.15); padding: 0.1rem 0.4rem; border: 1px solid rgba(0,200,0,0.2); }
    .card-name { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.4rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .card-meta { display: flex; gap: 0.6rem; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.6rem; }
    .card-bottom { display: flex; justify-content: space-between; align-items: center; }
    .card-value { font-weight: 700; color: var(--gold-dark); font-size: 1.05rem; }
    .card-rate { font-size: 0.75rem; color: var(--text-muted); }
    @media (max-width: 600px) { .list-page { padding: 1rem; } .finds-grid { grid-template-columns: 1fr; } }
  `,
})
export class FindListComponent {
  protected readonly svc = inject(ItemService);
  protected readonly auth = inject(AuthService);
  searchQuery = '';
  categoryFilter = '';
  sortBy = 'date-desc';
  private filterTrigger = signal(0);
  categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  filteredItems = computed(() => {
    this.filterTrigger();
    let items = [...this.svc.items()];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter((f) => f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) || f.notes.toLowerCase().includes(q));
    }
    if (this.categoryFilter) items = items.filter((f) => f.category === this.categoryFilter);
    switch (this.sortBy) {
      case 'date-desc': items.sort((a, b) => b.dateFound.localeCompare(a.dateFound)); break;
      case 'date-asc': items.sort((a, b) => a.dateFound.localeCompare(b.dateFound)); break;
      case 'value-desc': items.sort((a, b) => b.estimatedValue - a.estimatedValue); break;
      case 'value-asc': items.sort((a, b) => a.estimatedValue - b.estimatedValue); break;
      case 'name-asc': items.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return items;
  });

  onFilterChange() { this.filterTrigger.update((v) => v + 1); }
  getCategoryIcon(cat: ItemCategory) { return CATEGORY_ICONS[cat] ?? '❓'; }
  getCategoryLabel(cat: string) { return CATEGORY_LABELS[cat as ItemCategory] ?? cat; }
  getCategoryXp(cat: string) { return CATEGORY_XP[cat as ItemCategory] ?? 0; }
  getToneLabel(tone: string) { return (TONE_LABELS as Record<string, string>)[tone] ?? tone ?? '—'; }
}
