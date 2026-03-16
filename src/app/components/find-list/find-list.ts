import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ItemService } from '../../services/find.service';
import { AuthService } from '../../services/auth.service';
import {
  ItemCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_XP,
  TONE_LABELS,
} from '../../models/find.model';

@Component({
  selector: 'app-find-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="page">
      <div class="content">
        <div class="page-header">
          <div>
            <h1 class="page-title">Items</h1>
            <p class="page-sub">{{ svc.totalItems() }} items in your collection</p>
          </div>
          @if (auth.isAdmin()) {
            <a routerLink="/add" class="osrs-btn osrs-btn-primary">Log Item</a>
          }
        </div>

        <div class="filters">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search items..."
            class="filter-input" (ngModelChange)="onFilterChange()" />
          <select [(ngModel)]="categoryFilter" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="">All Categories</option>
            @for (opt of categoryOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
          <select [(ngModel)]="sortBy" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="value-desc">Highest Value</option>
            <option value="value-asc">Lowest Value</option>
            <option value="name-asc">Name A–Z</option>
          </select>
        </div>

        @if (filteredItems().length === 0) {
          <div class="section-panel">
            <div class="panel-body" style="text-align:center;padding:2rem;color:#777">
              No items match your filters.
            </div>
          </div>
        } @else {
          <div class="section-panel">
            <div class="panel-header"><h2>{{ filteredItems().length }} Items</h2></div>
            <div class="panel-body no-pad">
              <table class="hs-table">
                <thead>
                  <tr>
                    <th style="width:40px"></th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Value</th>
                    <th>XP</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of filteredItems(); track item.id) {
                    <tr class="item-row">
                      <td style="text-align:center;font-size:1.15rem">{{ getCategoryIcon(item.category) }}</td>
                      <td><a [routerLink]="['/items', item.id]">{{ item.name }}</a></td>
                      <td>{{ getCategoryLabel(item.category) }}</td>
                      <td>{{ item.estimatedValue | currency }}</td>
                      <td class="xp-cell">+{{ getCategoryXp(item.category) }}</td>
                      <td>{{ item.dateFound | date:'mediumDate' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .page { position: relative; z-index: 1; }
    .content { max-width: 1000px; margin: 0 auto; padding: 1.25rem 1rem 3rem; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;
    }
    .page-title {
      font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700;
      color: var(--btn-dark, #18140c);
    }
    .page-sub { font-size: 0.85rem; color: #777; }

    .filters {
      display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;
    }
    .filter-input, .filter-select {
      padding: 0.4rem 0.6rem;
      font-family: var(--font-body); font-size: 0.875rem;
      border: 2px solid var(--body-border, #94866d);
      background: #f9f6ef; color: #333;
    }
    .filter-input { flex: 1; min-width: 180px; }
    .filter-input:focus, .filter-select:focus { outline: none; border-color: #936039; }

    .section-panel {
      background: var(--body-main, #e2dbc8);
      border: 2px solid var(--body-border, #94866d);
    }
    .panel-header {
      background: linear-gradient(180deg, #605443, #3c352a);
      padding: 0.5rem 0.75rem;
    }
    .panel-header h2 {
      font-family: var(--font-heading);
      font-size: 0.9rem; font-weight: 700; color: #e2dbc8; margin: 0;
    }
    .panel-body { padding: 0.85rem; }
    .panel-body.no-pad { padding: 0; }

    .item-row td a { color: #936039; text-decoration: none; }
    .item-row td a:hover { text-decoration: underline; }
    .xp-cell { color: #2e5e05; font-weight: 700; }

    @media (max-width: 600px) {
      .content { padding: 1rem 0.75rem; }
      .filters { flex-direction: column; }
    }
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
}
