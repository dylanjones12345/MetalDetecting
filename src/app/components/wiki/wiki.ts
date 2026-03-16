import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, DecimalPipe, LowerCasePipe } from '@angular/common';
import { ItemService } from '../../services/find.service';
import {
  DetectorItem,
  ItemCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_XP,
  CATEGORIES_BY_XP,
  TONE_LABELS,
} from '../../models/find.model';

@Component({
  selector: 'app-wiki',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, DatePipe, DecimalPipe, LowerCasePipe],
  template: `
    <div class="wiki-page">
      <!-- Wiki header -->
      <div class="wiki-header">
        <div class="wiki-logo">
          <img src="img/sand-crab.png" class="wiki-logo-img" alt="" />
          <div>
            <h1>DetectorLog Wiki</h1>
            <span class="wiki-tagline">The Metal Detecting Encyclopedia</span>
          </div>
        </div>
        <div class="wiki-search-bar">
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
            placeholder="Search items..." class="wiki-search" />
        </div>
      </div>

      <div class="wiki-body">
        <!-- Search results -->
        @if (searchQuery.length > 0) {
          <div class="wiki-article">
            <h2 class="wiki-section-title">Search Results</h2>
            <p class="wiki-subtitle">{{ searchResults().length }} result(s) for "{{ searchQuery }}"</p>
            @if (searchResults().length === 0) {
              <div class="wiki-empty">No items found matching your search.</div>
            } @else {
              <table class="wiki-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Tone</th>
                    <th>XP</th>
                    <th>Value</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of searchResults(); track item.id) {
                    <tr>
                      <td class="wiki-icon-cell">{{ getCatIcon(item.category) }}</td>
                      <td><a [routerLink]="['/items', item.id]" class="wiki-link">{{ item.name }}</a></td>
                      <td>{{ getCatLabel(item.category) }}</td>
                      <td>{{ getToneLabel(item.tone) }}</td>
                      <td class="wiki-xp">+{{ getCatXp(item.category) }}</td>
                      <td>{{ item.estimatedValue | currency }}</td>
                      <td>{{ item.dateFound | date:'mediumDate' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        } @else {
          <!-- Main wiki content: category pages -->
          <div class="wiki-article">
            <h2 class="wiki-section-title">Item Categories</h2>
            <p class="wiki-intro">
              Below is a complete catalogue of all item categories encountered during metal detecting expeditions.
              Categories are sorted from highest XP reward to lowest. Drop rates update automatically as items are logged.
            </p>

            @for (cat of itemService.categorySummary(); track cat.category) {
              <div class="wiki-category-section" [id]="cat.category">
                <div class="wiki-cat-header">
                  <h3>
                    <span class="wiki-cat-icon">{{ cat.icon }}</span>
                    {{ cat.label }}
                  </h3>
                  <div class="wiki-cat-badges">
                    <span class="wiki-badge xp-badge">+{{ cat.xp }} XP</span>
                    <span class="wiki-badge count-badge">{{ cat.count }} found</span>
                    <span class="wiki-badge rate-badge">{{ cat.dropRate | number:'1.1-1' }}% drop rate</span>
                  </div>
                </div>

                <!-- Infobox -->
                <div class="wiki-infobox">
                  <div class="infobox-header">{{ cat.label }}</div>
                  <div class="infobox-image">{{ cat.icon }}</div>
                  <table class="infobox-table">
                    <tr><td class="ib-label">Category</td><td>{{ cat.label }}</td></tr>
                    <tr><td class="ib-label">XP per item</td><td class="ib-xp">+{{ cat.xp }}</td></tr>
                    <tr><td class="ib-label">Times found</td><td>{{ cat.count }}</td></tr>
                    <tr><td class="ib-label">Drop rate</td><td>{{ cat.dropRate | number:'1.1-1' }}%</td></tr>
                    <tr><td class="ib-label">Total XP earned</td><td class="ib-xp">{{ cat.count * cat.xp | number }}</td></tr>
                  </table>
                </div>

                <!-- Items in this category -->
                @if (getItemsForCategory(cat.category).length > 0) {
                  <table class="wiki-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Tone</th>
                        <th>Value</th>
                        <th>Date Found</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of getItemsForCategory(cat.category); track item.id) {
                        <tr>
                          <td><a [routerLink]="['/items', item.id]" class="wiki-link">{{ item.name }}</a></td>
                          <td>{{ getToneLabel(item.tone) }}</td>
                          <td>{{ item.estimatedValue | currency }}</td>
                          <td>{{ item.dateFound | date:'mediumDate' }}</td>
                          <td>{{ item.location || '—' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                } @else {
                  <p class="wiki-no-items">No {{ cat.label | lowercase }} items have been logged yet.</p>
                }
              </div>
            }
          </div>

          <!-- Table of contents sidebar -->
          <div class="wiki-toc">
            <div class="toc-header">Contents</div>
            @for (cat of itemService.categorySummary(); track cat.category; let i = $index) {
              <a class="toc-link" [href]="'#' + cat.category">
                <span class="toc-num">{{ i + 1 }}</span>
                {{ cat.icon }} {{ cat.label }}
                <span class="toc-count">({{ cat.count }})</span>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .wiki-page { max-width: 1200px; margin: 0 auto; padding: 0; }

    /* Wiki Header - styled like OSRS Wiki */
    .wiki-header {
      background: linear-gradient(180deg, #2b4a6b, #1b3a5b);
      border-bottom: 3px solid #0e2a40;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .wiki-logo {
      display: flex; align-items: center; gap: 0.75rem;
    }
    .wiki-logo-img { width: 42px; height: 42px; image-rendering: pixelated; }
    .wiki-logo h1 {
      font-family: 'Press Start 2P', cursive;
      font-size: 0.7rem;
      color: #e0d5b8;
      text-shadow: 1px 1px 0 #000;
    }
    .wiki-tagline { font-size: 0.8rem; color: #8ab0d0; }
    .wiki-search-bar { flex: 1; max-width: 400px; }
    .wiki-search {
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-family: inherit;
      font-size: 1rem;
      border: 2px solid #4a6a8a;
      background: #f8f4e8;
      color: #1a1a1a;
    }
    .wiki-search:focus { outline: none; border-color: #6a9aca; }

    /* Wiki body layout */
    .wiki-body {
      display: flex;
      gap: 0;
      background: #f8f4e8;
      border: 1px solid #c0b090;
      min-height: 60vh;
      position: relative;
    }
    .wiki-article {
      flex: 1;
      padding: 1.5rem;
      color: #1a1a1a;
      font-size: 1rem;
      line-height: 1.5;
    }
    .wiki-section-title {
      font-size: 1.4rem;
      color: #1a1a1a;
      border-bottom: 2px solid #a0a0a0;
      padding-bottom: 0.35rem;
      margin-bottom: 0.75rem;
      font-family: inherit;
    }
    .wiki-subtitle { color: #555; margin-bottom: 1rem; }
    .wiki-intro { color: #333; margin-bottom: 1.5rem; }
    .wiki-empty { color: #666; padding: 1rem; font-style: italic; }
    .wiki-no-items { color: #888; font-style: italic; margin: 0.5rem 0 1.5rem; }

    /* Category sections */
    .wiki-category-section {
      margin-bottom: 2rem;
      padding-top: 0.5rem;
      border-top: 1px solid #d0c8b0;
    }
    .wiki-cat-header {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;
    }
    .wiki-cat-header h3 {
      font-size: 1.2rem; color: #1a1a1a;
      display: flex; align-items: center; gap: 0.4rem;
    }
    .wiki-cat-icon { font-size: 1.3rem; }
    .wiki-cat-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .wiki-badge {
      font-size: 0.75rem; padding: 0.15rem 0.5rem;
      border: 1px solid #aaa; font-weight: 700;
    }
    .xp-badge { background: #2a2a1a; color: #00ff00; border-color: #555540; }
    .count-badge { background: #1b3a5b; color: #8ab0d0; border-color: #2b4a6b; }
    .rate-badge { background: #5a3a1a; color: #f0d080; border-color: #7a5430; }

    /* Wiki infobox (OSRS style) */
    .wiki-infobox {
      float: right;
      width: 220px;
      margin: 0 0 1rem 1rem;
      border: 2px solid #8a7a5a;
      background: #e8dcc0;
    }
    .infobox-header {
      background: #5b4a2a;
      color: #e8dcc0;
      text-align: center;
      padding: 0.35rem;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .infobox-image {
      text-align: center;
      font-size: 3rem;
      padding: 0.75rem;
      background: #d8ccaa;
      border-bottom: 1px solid #8a7a5a;
    }
    .infobox-table { width: 100%; border-collapse: collapse; }
    .infobox-table tr { border-bottom: 1px solid #c0b090; }
    .infobox-table td { padding: 0.25rem 0.4rem; font-size: 0.85rem; }
    .ib-label { font-weight: 700; background: #ddd0b0; width: 45%; color: #3a2a1a; }
    .ib-xp { color: #1a7a1a; font-weight: 700; }

    /* Wiki tables */
    .wiki-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.5rem 0 1.5rem;
      font-size: 0.9rem;
      clear: both;
    }
    .wiki-table th {
      background: #5b4a2a;
      color: #e8dcc0;
      padding: 0.4rem 0.6rem;
      text-align: left;
      font-weight: 700;
      border: 1px solid #4a3a1a;
    }
    .wiki-table td {
      padding: 0.35rem 0.6rem;
      border: 1px solid #c0b090;
    }
    .wiki-table tbody tr:nth-child(even) { background: #ede4cc; }
    .wiki-table tbody tr:nth-child(odd) { background: #f8f4e8; }
    .wiki-table tbody tr:hover { background: #d8d0b8; }
    .wiki-icon-cell { font-size: 1.2rem; text-align: center; width: 40px; }
    .wiki-xp { color: #1a7a1a; font-weight: 700; }
    .wiki-link { color: #2a5a8a; text-decoration: none; }
    .wiki-link:hover { text-decoration: underline; }

    /* Table of contents sidebar */
    .wiki-toc {
      width: 200px;
      flex-shrink: 0;
      border-left: 1px solid #c0b090;
      background: #f0e8d0;
      padding: 1rem 0.75rem;
      position: sticky;
      top: 56px;
      align-self: flex-start;
      max-height: calc(100vh - 56px);
      overflow-y: auto;
    }
    .toc-header {
      font-weight: 700;
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
      padding-bottom: 0.35rem;
      border-bottom: 1px solid #c0b090;
      color: #3a2a1a;
    }
    .toc-link {
      display: block;
      padding: 0.25rem 0;
      font-size: 0.85rem;
      color: #2a5a8a;
      text-decoration: none;
    }
    .toc-link:hover { text-decoration: underline; }
    .toc-num { color: #888; margin-right: 0.3rem; }
    .toc-count { color: #888; font-size: 0.75rem; }

    @media (max-width: 768px) {
      .wiki-body { flex-direction: column-reverse; }
      .wiki-toc {
        width: 100%; position: static;
        border-left: none; border-bottom: 1px solid #c0b090;
        display: flex; flex-wrap: wrap; gap: 0.25rem; padding: 0.75rem;
      }
      .toc-header { width: 100%; }
      .wiki-infobox { float: none; width: 100%; margin: 0 0 1rem 0; }
      .wiki-header { padding: 0.75rem; }
    }
  `,
})
export class WikiComponent {
  protected readonly itemService = inject(ItemService);

  searchQuery = '';
  private searchTrigger = signal(0);

  searchResults = computed(() => {
    this.searchTrigger();
    if (!this.searchQuery) return [];
    return this.itemService.searchItems(this.searchQuery);
  });

  onSearch() {
    this.searchTrigger.update((v) => v + 1);
  }

  getItemsForCategory(cat: ItemCategory): DetectorItem[] {
    return this.itemService.items()
      .filter((i) => i.category === cat)
      .sort((a, b) => b.dateFound.localeCompare(a.dateFound));
  }

  getCatIcon(cat: ItemCategory) { return CATEGORY_ICONS[cat] ?? '❓'; }
  getCatLabel(cat: ItemCategory) { return CATEGORY_LABELS[cat] ?? cat; }
  getCatXp(cat: ItemCategory) { return CATEGORY_XP[cat] ?? 0; }
  getToneLabel(tone: string) { return (TONE_LABELS as Record<string, string>)[tone] ?? tone ?? '—'; }
}
