import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FindService } from '../../services/find.service';
import { AuthService } from '../../services/auth.service';
import {
  DetectorFind,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_XP,
  CONDITION_LABELS,
  FindCategory,
} from '../../models/find.model';

@Component({
  selector: 'app-find-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    @if (find(); as f) {
      <div class="detail-page">
        <div class="detail-nav">
          <a routerLink="/finds" class="back-link">← Back to Finds</a>
          @if (auth.isAdmin()) {
            <div class="detail-actions">
              <a [routerLink]="['/edit', f.id]" class="btn-edit">✏️ Edit</a>
              <button class="btn-delete" (click)="onDelete()">🗑️ Drop</button>
            </div>
          }
        </div>

        <div class="detail-hero">
          @if (f.imageUrl) {
            <div class="hero-image osrs-panel" [style.background-image]="'url(' + f.imageUrl + ')'"></div>
          } @else {
            <div class="hero-image osrs-panel placeholder">
              <span>{{ getIcon(f) }}</span>
            </div>
          }
          <div class="hero-info">
            <span class="detail-category">{{ getCategory(f) }}</span>
            <h1>{{ f.name }}</h1>
            <div class="hero-meta">
              <span class="meta-chip osrs-panel">📅 {{ f.dateFound | date:'longDate' }}</span>
              @if (f.location) {
                <span class="meta-chip osrs-panel">📍 {{ f.location }}</span>
              }
              <span class="meta-chip xp-chip">+{{ getXp(f) }} xp</span>
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-card osrs-panel">
            <h3>💰 Value</h3>
            <span class="detail-big-value gold">{{ f.estimatedValue | currency }}</span>
          </div>
          <div class="detail-card osrs-panel">
            <h3>📏 Depth</h3>
            <span class="detail-big-value">{{ f.depth | number:'1.1-1' }} {{ f.depthUnit }}</span>
          </div>
          <div class="detail-card osrs-panel">
            <h3>⚖️ Weight</h3>
            <span class="detail-big-value">{{ f.weight | number:'1.1-1' }} {{ f.weightUnit }}</span>
          </div>
          <div class="detail-card osrs-panel">
            <h3>⭐ Condition</h3>
            <span class="detail-big-value condition" [attr.data-condition]="f.condition">
              {{ getCondition(f) }}
            </span>
          </div>
        </div>

        @if (f.notes) {
          <div class="notes-section osrs-panel">
            <h3>📝 Notes</h3>
            <p>{{ f.notes }}</p>
          </div>
        }
      </div>
    } @else {
      <div class="not-found osrs-panel" style="max-width:500px;margin:2rem auto;padding:2rem;text-align:center;">
        <h2>Find not found!</h2>
        <p style="margin:0.5rem 0 1rem;color:var(--text-muted)">This treasure seems to have vanished...</p>
        <a routerLink="/finds" style="color:var(--gold-dark);">← Back to Finds</a>
      </div>
    }
  `,
  styles: `
    .detail-page { max-width: 900px; margin: 0 auto; padding: 1.5rem; }
    .detail-nav {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;
    }
    .back-link {
      color: var(--text-light); text-decoration: none; font-size: 0.95rem;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }
    .back-link:hover { color: var(--gold); }
    .detail-actions { display: flex; gap: 0.4rem; }
    .btn-edit, .btn-delete {
      padding: 0.4rem 0.85rem; font-weight: 600; font-size: 0.9rem;
      cursor: pointer; font-family: inherit; transition: filter 0.15s;
    }
    .btn-edit {
      background: linear-gradient(180deg, var(--surface-light), var(--surface-dark));
      color: var(--text); text-decoration: none;
      border: 2px solid var(--border); border-top-color: var(--border-light); border-left-color: var(--border-light);
      box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
    }
    .btn-edit:hover { filter: brightness(1.05); }
    .btn-delete {
      background: linear-gradient(180deg, #e74c3c, #c0392b); color: #fff;
      border: 2px solid #7a1a1a; border-top-color: #ff6b6b; border-left-color: #ff6b6b;
      box-shadow: 2px 2px 0 rgba(0,0,0,0.3); text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
    }
    .btn-delete:hover { filter: brightness(1.1); }

    .detail-hero { display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1.5rem; }
    .hero-image {
      width: 200px; height: 200px; flex-shrink: 0;
      background-size: cover; background-position: center; padding: 0 !important;
    }
    .hero-image.placeholder {
      display: flex; align-items: center; justify-content: center; font-size: 4.5rem;
      background: linear-gradient(180deg, var(--surface-light), var(--surface-dark)) !important;
    }
    .hero-info { flex: 1; }
    .detail-category {
      font-size: 0.85rem; font-weight: 600; text-transform: uppercase;
      color: var(--gold); letter-spacing: 0.5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }
    .hero-info h1 {
      font-size: 1.8rem; margin: 0.2rem 0 0.65rem;
      color: var(--text-light); text-shadow: 2px 2px 3px rgba(0,0,0,0.5);
    }
    .hero-meta { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .meta-chip { padding: 0.3rem 0.65rem !important; font-size: 0.9rem; color: var(--text); }
    .xp-chip {
      background: linear-gradient(180deg, #3a3a2a, #2a2a1a);
      border: 2px solid #555540; color: #00ff00; font-weight: 700;
      padding: 0.3rem 0.65rem;
    }

    .detail-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem; margin-bottom: 1.5rem;
    }
    .detail-card { padding: 1rem; text-align: center; }
    .detail-card h3 { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem; }
    .detail-big-value { font-size: 1.25rem; font-weight: 700; }
    .detail-big-value.gold { color: var(--gold-dark); text-shadow: 1px 1px 0 rgba(0,0,0,0.1); }
    .condition[data-condition="excellent"] { color: #1a7a1a; }
    .condition[data-condition="good"] { color: #1a5276; }
    .condition[data-condition="fair"] { color: #8a6914; }
    .condition[data-condition="poor"] { color: #922b21; }

    .notes-section { padding: 1.25rem; }
    .notes-section h3 {
      font-size: 0.95rem; color: var(--text-muted); margin-bottom: 0.6rem;
      border-bottom: 2px solid var(--border-light); padding-bottom: 0.3rem;
    }
    .notes-section p { line-height: 1.6; color: var(--text); white-space: pre-wrap; }

    @media (max-width: 600px) {
      .detail-page { padding: 1rem; }
      .detail-hero { flex-direction: column; gap: 1rem; }
      .hero-image { width: 100%; height: 200px; }
    }
  `,
})
export class FindDetailComponent implements OnInit {
  private findService = inject(FindService);
  protected auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  find = signal<DetectorFind | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.find.set(this.findService.getById(id) ?? null);
    }
  }

  onDelete() {
    const f = this.find();
    if (f && confirm(`Drop "${f.name}"? This cannot be undone.`)) {
      this.findService.delete(f.id);
      this.router.navigate(['/finds']);
    }
  }

  getIcon(f: DetectorFind) { return CATEGORY_ICONS[f.category] ?? '❓'; }
  getCategory(f: DetectorFind) { return CATEGORY_LABELS[f.category] ?? f.category; }
  getCondition(f: DetectorFind) { return CONDITION_LABELS[f.condition] ?? f.condition; }
  getXp(f: DetectorFind) { return CATEGORY_XP[f.category] ?? 0; }
}
