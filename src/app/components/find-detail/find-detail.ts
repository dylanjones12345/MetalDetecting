import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ItemService } from '../../services/find.service';
import { AuthService } from '../../services/auth.service';
import {
  DetectorItem,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_XP,
  CONDITION_LABELS,
  TONE_LABELS,
} from '../../models/find.model';

@Component({
  selector: 'app-find-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    @if (item(); as f) {
      <div class="page">
        <div class="content">
          <div class="detail-nav">
            <a routerLink="/items">← Back to Items</a>
            @if (auth.isAdmin()) {
              <div class="detail-actions">
                <a [routerLink]="['/edit', f.id]" class="osrs-btn">Edit</a>
                <button class="osrs-btn osrs-btn-danger" (click)="onDelete()">Drop</button>
              </div>
            }
          </div>

          <div class="detail-layout">
            <!-- Infobox -->
            <div class="infobox">
              <div class="infobox-title">{{ f.name }}</div>
              @if (f.imageUrl) {
                <div class="infobox-image" [style.background-image]="'url(' + f.imageUrl + ')'"></div>
              } @else {
                <div class="infobox-icon">{{ getIcon(f) }}</div>
              }
              <table class="infobox-stats">
                <tr><td class="ib-key">Category</td><td>{{ getCategory(f) }}</td></tr>
                @if (f.tone) {
                  <tr><td class="ib-key">Tone</td><td>{{ getTone(f) }}</td></tr>
                }
                <tr><td class="ib-key">XP</td><td class="ib-xp">+{{ getXp(f) }}</td></tr>
                <tr><td class="ib-key">Drop Rate</td><td>{{ svc.getDropRate(f.category) | number:'1.1-1' }}%</td></tr>
                <tr><td class="ib-key">Value</td><td class="ib-gold">{{ f.estimatedValue | currency }}</td></tr>
                <tr><td class="ib-key">Condition</td><td>{{ getCondition(f) }}</td></tr>
                <tr><td class="ib-key">Depth</td><td>{{ f.depth | number:'1.1-1' }} {{ f.depthUnit }}</td></tr>
                <tr><td class="ib-key">Weight</td><td>{{ f.weight | number:'1.1-1' }} {{ f.weightUnit }}</td></tr>
                <tr><td class="ib-key">Date</td><td>{{ f.dateFound | date:'longDate' }}</td></tr>
                @if (f.location) {
                  <tr><td class="ib-key">Location</td><td>{{ f.location }}</td></tr>
                }
              </table>
            </div>

            <!-- Article content -->
            <div class="article">
              <h1 class="article-title">{{ f.name }}</h1>
              <p class="article-lead">
                <strong>{{ f.name }}</strong> is a <strong>{{ getCategory(f) }}</strong> item
                found on {{ f.dateFound | date:'longDate' }}@if (f.location) { at {{ f.location }}}.
                It awards <strong class="xp-text">+{{ getXp(f) }} XP</strong> in Metal Detecting.
              </p>

              @if (f.notes) {
                <h2 class="article-h2">Notes</h2>
                <p class="article-notes">{{ f.notes }}</p>
              }
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="page">
        <div class="content" style="text-align:center;padding:3rem">
          <h2>Item not found</h2>
          <a routerLink="/items">← Back to Items</a>
        </div>
      </div>
    }
  `,
  styles: `
    .page { position: relative; z-index: 1; }
    .content { max-width: 900px; margin: 0 auto; padding: 1.25rem 1rem 3rem; }

    .detail-nav {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1rem;
    }
    .detail-nav > a { color: #936039; font-size: 0.9rem; }
    .detail-nav > a:hover { text-decoration: underline; }
    .detail-actions { display: flex; gap: 0.35rem; }

    .detail-layout { display: flex; gap: 1rem; align-items: flex-start; }

    /* Infobox (wiki style) */
    .infobox {
      width: 260px; flex-shrink: 0;
      border: 2px solid #94866d;
      background: #d8ccb4;
      order: 2;
    }
    .infobox-title {
      background: linear-gradient(180deg, #605443, #3c352a);
      color: #e2dbc8; text-align: center; padding: 0.4rem;
      font-family: var(--font-heading); font-weight: 700; font-size: 0.9rem;
    }
    .infobox-image {
      height: 180px; background-size: cover; background-position: center;
      background-color: #c0a886; border-bottom: 1px solid #94866d;
    }
    .infobox-icon {
      text-align: center; font-size: 3.5rem;
      padding: 1.25rem; background: #c0a886;
      border-bottom: 1px solid #94866d;
    }
    .infobox-stats { width: 100%; border-collapse: collapse; }
    .infobox-stats td {
      padding: 0.25rem 0.45rem; font-size: 0.82rem;
      border-bottom: 1px solid #b8a282;
    }
    .ib-key { font-weight: 600; background: #d0bd97; color: #3c352a; width: 38%; }
    .ib-xp { color: #2e5e05; font-weight: 700; }
    .ib-gold { color: #b8860b; font-weight: 700; }

    /* Article */
    .article { flex: 1; order: 1; }
    .article-title {
      font-family: var(--font-heading);
      font-size: 1.6rem; font-weight: 700;
      color: #18140c;
      border-bottom: 2px solid #94866d;
      padding-bottom: 0.3rem; margin-bottom: 0.75rem;
    }
    .article-lead { font-size: 0.95rem; color: #333; line-height: 1.6; margin-bottom: 1rem; }
    .xp-text { color: #2e5e05; }
    .article-h2 {
      font-family: var(--font-heading);
      font-size: 1.1rem; font-weight: 700;
      color: #18140c;
      border-bottom: 1px solid #b8a282;
      padding-bottom: 0.2rem; margin-bottom: 0.5rem;
    }
    .article-notes { white-space: pre-wrap; color: #4c4c4c; line-height: 1.6; }

    @media (max-width: 700px) {
      .detail-layout { flex-direction: column; }
      .infobox { width: 100%; order: 1; }
      .article { order: 2; }
    }
  `,
})
export class FindDetailComponent implements OnInit {
  protected svc = inject(ItemService);
  protected auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  item = signal<DetectorItem | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.item.set(this.svc.getById(id) ?? null);
  }
  onDelete() {
    const f = this.item();
    if (f && confirm(`Drop "${f.name}"? This cannot be undone.`)) {
      this.svc.delete(f.id); this.router.navigate(['/items']);
    }
  }
  getIcon(f: DetectorItem) { return CATEGORY_ICONS[f.category] ?? '❓'; }
  getCategory(f: DetectorItem) { return CATEGORY_LABELS[f.category] ?? f.category; }
  getCondition(f: DetectorItem) { return CONDITION_LABELS[f.condition] ?? f.condition; }
  getTone(f: DetectorItem) { return TONE_LABELS[f.tone] ?? f.tone ?? '—'; }
  getXp(f: DetectorItem) { return CATEGORY_XP[f.category] ?? 0; }
}
