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
    <div class="wiki">
      <!-- Wiki header -->
      <div class="wiki-header">
        <div class="wiki-brand">
          <img src="img/sand-crab.png" class="wiki-logo" alt="" />
          <div>
            <h1>DetectorLog Wiki</h1>
            <span class="wiki-sub">The Metal Detecting Encyclopedia</span>
          </div>
        </div>
        <div class="wiki-search-wrap">
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
            placeholder="Search items..." class="wiki-search" />
        </div>
      </div>

      <div class="wiki-layout">
        <!-- Table of contents -->
        <aside class="wiki-toc">
          <div class="toc-title">Contents</div>
          @for (cat of itemService.categorySummary(); track cat.category; let i = $index) {
            <a class="toc-item" [href]="'#' + cat.category">
              <span class="toc-num">{{ i + 1 }}</span>
              {{ cat.icon }} {{ cat.label }}
              <span class="toc-count">({{ cat.count }})</span>
            </a>
          }
        </aside>

        <!-- Article body -->
        <main class="wiki-article">
          @if (searchQuery.length > 0) {
            <h2 class="wiki-h2">Search Results</h2>
            <p class="wiki-note">{{ searchResults().length }} result(s) for "{{ searchQuery }}"</p>
            @if (searchResults().length === 0) {
              <p class="wiki-muted">No items matched your search.</p>
            } @else {
              <table class="wiki-table">
                <thead>
                  <tr>
                    <th></th><th>Name</th><th>Category</th><th>Tone</th><th>XP</th><th>Value</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of searchResults(); track item.id) {
                    <tr>
                      <td class="icon-cell">{{ getCatIcon(item.category) }}</td>
                      <td><a [routerLink]="['/items', item.id]">{{ item.name }}</a></td>
                      <td>{{ getCatLabel(item.category) }}</td>
                      <td>{{ getToneLabel(item.tone) }}</td>
                      <td class="xp-cell">+{{ getCatXp(item.category) }}</td>
                      <td>{{ item.estimatedValue | currency }}</td>
                      <td>{{ item.dateFound | date:'mediumDate' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          } @else {
            <h2 class="wiki-h2">Item Categories</h2>
            <p class="wiki-intro">
              A complete catalogue of all item categories encountered during metal detecting.
              Categories are sorted from highest XP reward to lowest. Drop rates update automatically.
            </p>

            @for (cat of itemService.categorySummary(); track cat.category) {
              <section class="wiki-section" [id]="cat.category">
                <h3 class="wiki-h3">
                  <span class="cat-icon">{{ cat.icon }}</span>
                  {{ cat.label }}
                </h3>

                <!-- Infobox -->
                <div class="infobox">
                  <div class="infobox-title">{{ cat.label }}</div>
                  <div class="infobox-icon">{{ cat.icon }}</div>
                  <table class="infobox-stats">
                    <tr><td class="ib-key">XP per item</td><td class="ib-xp">+{{ cat.xp }}</td></tr>
                    <tr><td class="ib-key">Times found</td><td>{{ cat.count }}</td></tr>
                    <tr><td class="ib-key">Drop rate</td><td>{{ cat.dropRate | number:'1.1-1' }}%</td></tr>
                    <tr><td class="ib-key">Total XP</td><td class="ib-xp">{{ cat.count * cat.xp | number }}</td></tr>
                  </table>
                </div>

                @if (getItemsForCategory(cat.category).length > 0) {
                  <table class="wiki-table">
                    <thead>
                      <tr><th>Name</th><th>Tone</th><th>Value</th><th>Date Found</th><th>Location</th></tr>
                    </thead>
                    <tbody>
                      @for (item of getItemsForCategory(cat.category); track item.id) {
                        <tr>
                          <td><a [routerLink]="['/items', item.id]">{{ item.name }}</a></td>
                          <td>{{ getToneLabel(item.tone) }}</td>
                          <td>{{ item.estimatedValue | currency }}</td>
                          <td>{{ item.dateFound | date:'mediumDate' }}</td>
                          <td>{{ item.location || '—' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                } @else {
                  <p class="wiki-muted">No {{ cat.label | lowercase }} items have been logged yet.</p>
                }
              </section>
            }
          }
        </main>
      </div>
    </div>
  `,
  styles: `
    .wiki { position: relative; z-index: 1; }

    /* Header — matches OSRS Wiki top bar */
    .wiki-header {
      background: linear-gradient(180deg, #605443, #3c352a);
      border-bottom: 2px solid #18140c;
      padding: 0.85rem 1.25rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; flex-wrap: wrap;
    }
    .wiki-brand {
      display: flex; align-items: center; gap: 0.6rem;
    }
    .wiki-logo { width: 36px; height: 36px; image-rendering: pixelated; }
    .wiki-brand h1 {
      font-family: var(--font-heading);
      font-size: 1rem; font-weight: 700;
      color: #e2dbc8;
    }
    .wiki-sub { font-size: 0.75rem; color: #94866d; }
    .wiki-search-wrap { flex: 1; max-width: 360px; }
    .wiki-search {
      width: 100%; padding: 0.45rem 0.65rem;
      font-family: var(--font-body); font-size: 0.875rem;
      border: 2px solid #94866d; background: #f9f6ef; color: #333;
    }
    .wiki-search:focus { outline: none; border-color: #936039; }

    /* Layout */
    .wiki-layout {
      max-width: 1200px; margin: 0 auto;
      display: flex; gap: 0;
      min-height: 60vh;
    }

    /* TOC sidebar */
    .wiki-toc {
      width: 200px; flex-shrink: 0;
      background: var(--body-light, #d8ccb4);
      border-right: 1px solid var(--body-border, #94866d);
      padding: 0.85rem 0.65rem;
      position: sticky; top: 52px;
      align-self: flex-start;
      max-height: calc(100vh - 52px);
      overflow-y: auto;
    }
    .toc-title {
      font-family: var(--font-heading);
      font-weight: 700; font-size: 0.85rem;
      color: #3c352a;
      border-bottom: 1px solid var(--body-border, #94866d);
      padding-bottom: 0.3rem; margin-bottom: 0.4rem;
    }
    .toc-item {
      display: block; padding: 0.2rem 0;
      font-size: 0.8rem; color: #936039;
      text-decoration: none;
    }
    .toc-item:hover { text-decoration: underline; }
    .toc-num { color: #94866d; margin-right: 0.2rem; }
    .toc-count { color: #94866d; font-size: 0.7rem; }

    /* Article */
    .wiki-article {
      flex: 1; padding: 1.25rem;
      background: var(--body-main, #e2dbc8);
      color: #333;
      font-size: 0.9rem; line-height: 1.6;
    }
    .wiki-h2 {
      font-family: var(--font-heading);
      font-size: 1.35rem; font-weight: 700;
      color: #18140c;
      border-bottom: 2px solid #94866d;
      padding-bottom: 0.3rem; margin-bottom: 0.6rem;
    }
    .wiki-h3 {
      font-family: var(--font-heading);
      font-size: 1.1rem; font-weight: 700;
      color: #18140c;
      border-bottom: 1px solid #b8a282;
      padding-bottom: 0.2rem; margin-bottom: 0.6rem;
      display: flex; align-items: center; gap: 0.4rem;
    }
    .cat-icon { font-size: 1.2rem; }
    .wiki-intro { color: #4c4c4c; margin-bottom: 1.25rem; }
    .wiki-note { color: #605443; margin-bottom: 0.75rem; }
    .wiki-muted { color: #777; font-style: italic; margin-bottom: 1rem; }

    /* Wiki section */
    .wiki-section {
      margin-bottom: 1.75rem;
      padding-top: 0.5rem;
    }

    /* Infobox (OSRS Wiki style) */
    .infobox {
      float: right; width: 210px;
      margin: 0 0 0.75rem 1rem;
      border: 2px solid #94866d;
      background: #d8ccb4;
    }
    .infobox-title {
      background: linear-gradient(180deg, #605443, #3c352a);
      color: #e2dbc8;
      text-align: center; padding: 0.3rem;
      font-family: var(--font-heading);
      font-weight: 700; font-size: 0.85rem;
    }
    .infobox-icon {
      text-align: center; font-size: 2.5rem;
      padding: 0.6rem; background: #c0a886;
      border-bottom: 1px solid #94866d;
    }
    .infobox-stats { width: 100%; border-collapse: collapse; }
    .infobox-stats td { padding: 0.2rem 0.4rem; font-size: 0.8rem; border-bottom: 1px solid #b8a282; }
    .ib-key { font-weight: 600; background: #d0bd97; color: #3c352a; width: 45%; }
    .ib-xp { color: #2e5e05; font-weight: 700; }

    /* Wiki tables */
    .wiki-table {
      width: 100%; border-collapse: collapse;
      margin: 0.4rem 0 1rem; font-size: 0.85rem;
      clear: both;
    }
    .wiki-table th {
      background: linear-gradient(180deg, #605443, #3c352a);
      color: #e2dbc8; padding: 0.4rem 0.6rem;
      text-align: left; font-weight: 600;
      border: 1px solid #3c352a;
    }
    .wiki-table td {
      padding: 0.35rem 0.6rem; border: 1px solid #b8a282;
    }
    .wiki-table tbody tr:nth-child(odd) { background: #e2dbc8; }
    .wiki-table tbody tr:nth-child(even) { background: #d8ccb4; }
    .wiki-table tbody tr:hover { background: #d0bd97; }
    .wiki-table a { color: #936039; }
    .wiki-table a:hover { text-decoration: underline; }
    .icon-cell { text-align: center; width: 36px; font-size: 1.1rem; }
    .xp-cell { color: #2e5e05; font-weight: 700; }

    @media (max-width: 768px) {
      .wiki-layout { flex-direction: column-reverse; }
      .wiki-toc {
        width: 100%; position: static;
        border-right: none; border-bottom: 1px solid #94866d;
        display: flex; flex-wrap: wrap; gap: 0.2rem; padding: 0.6rem;
      }
      .toc-title { width: 100%; }
      .infobox { float: none; width: 100%; margin: 0 0 0.75rem; }
      .wiki-header { padding: 0.65rem; }
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

  onSearch() { this.searchTrigger.update((v) => v + 1); }

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
