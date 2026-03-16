import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FindService } from '../../services/find.service';
import {
  DetectorFind,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  MATERIAL_LABELS,
  CONDITION_LABELS,
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
          <div class="detail-actions">
            <a [routerLink]="['/edit', f.id]" class="btn-edit">Edit</a>
            <button class="btn-delete" (click)="onDelete()">Delete</button>
          </div>
        </div>

        <div class="detail-hero">
          @if (f.imageUrl) {
            <div class="hero-image" [style.background-image]="'url(' + f.imageUrl + ')'"></div>
          } @else {
            <div class="hero-image placeholder">
              <span>{{ getIcon(f) }}</span>
            </div>
          }
          <div class="hero-info">
            <span class="detail-category">{{ getCategory(f) }}</span>
            <h1>{{ f.name }}</h1>
            <div class="hero-meta">
              <span class="meta-chip">📅 {{ f.dateFound | date:'longDate' }}</span>
              @if (f.location) {
                <span class="meta-chip">📍 {{ f.location }}</span>
              }
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-card">
            <h3>💰 Value</h3>
            <span class="detail-big-value gold">{{ f.estimatedValue | currency }}</span>
          </div>
          <div class="detail-card">
            <h3>🏷️ Material</h3>
            <span class="detail-big-value">{{ getMaterial(f) }}</span>
          </div>
          <div class="detail-card">
            <h3>📏 Depth</h3>
            <span class="detail-big-value">{{ f.depth | number:'1.1-1' }} {{ f.depthUnit }}</span>
          </div>
          <div class="detail-card">
            <h3>⚖️ Weight</h3>
            <span class="detail-big-value">{{ f.weight | number:'1.1-1' }} {{ f.weightUnit }}</span>
          </div>
          <div class="detail-card">
            <h3>⭐ Condition</h3>
            <span class="detail-big-value condition" [attr.data-condition]="f.condition">
              {{ getCondition(f) }}
            </span>
          </div>
        </div>

        @if (f.notes) {
          <div class="notes-section">
            <h3>📝 Notes</h3>
            <p>{{ f.notes }}</p>
          </div>
        }
      </div>
    } @else {
      <div class="not-found">
        <h2>Find not found</h2>
        <a routerLink="/finds">← Back to Finds</a>
      </div>
    }
  `,
  styles: `
    .detail-page { max-width: 900px; margin: 0 auto; padding: 2rem; }
    .detail-nav {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.5rem;
    }
    .back-link { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { color: var(--text); }
    .detail-actions { display: flex; gap: 0.5rem; }
    .btn-edit, .btn-delete {
      padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600;
      font-size: 0.85rem; cursor: pointer; border: none; text-decoration: none;
      transition: all 0.2s;
    }
    .btn-edit { background: var(--surface-hover); color: var(--gold); }
    .btn-edit:hover { background: var(--border); }
    .btn-delete { background: rgba(231,76,60,0.15); color: #e74c3c; }
    .btn-delete:hover { background: rgba(231,76,60,0.25); }

    .detail-hero {
      display: flex; gap: 2rem; align-items: flex-start;
      margin-bottom: 2rem;
    }
    .hero-image {
      width: 200px; height: 200px; flex-shrink: 0;
      border-radius: 16px; background-size: cover; background-position: center;
      background-color: var(--surface-hover); border: 1px solid var(--border);
    }
    .hero-image.placeholder {
      display: flex; align-items: center; justify-content: center; font-size: 5rem;
    }
    .hero-info { flex: 1; }
    .detail-category {
      font-size: 0.8rem; font-weight: 600; text-transform: uppercase;
      color: var(--gold); letter-spacing: 0.5px;
    }
    .hero-info h1 { font-size: 2rem; margin: 0.25rem 0 0.75rem; }
    .hero-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .meta-chip {
      background: var(--surface); border: 1px solid var(--border);
      padding: 0.35rem 0.75rem; border-radius: 20px;
      font-size: 0.85rem; color: var(--text-muted);
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem; margin-bottom: 2rem;
    }
    .detail-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 12px; padding: 1.25rem; text-align: center;
    }
    .detail-card h3 { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem; }
    .detail-big-value { font-size: 1.3rem; font-weight: 700; }
    .detail-big-value.gold { color: var(--gold); }
    .condition[data-condition="excellent"] { color: #2ecc71; }
    .condition[data-condition="good"] { color: #3498db; }
    .condition[data-condition="fair"] { color: #f1c40f; }
    .condition[data-condition="poor"] { color: #e74c3c; }

    .notes-section {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 12px; padding: 1.5rem;
    }
    .notes-section h3 { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem; }
    .notes-section p { line-height: 1.6; color: var(--text); white-space: pre-wrap; }

    .not-found { text-align: center; padding: 4rem 2rem; }
    .not-found a { color: var(--gold); text-decoration: none; }

    @media (max-width: 600px) {
      .detail-page { padding: 1rem; }
      .detail-hero { flex-direction: column; gap: 1rem; }
      .hero-image { width: 100%; height: 220px; }
    }
  `,
})
export class FindDetailComponent implements OnInit {
  private findService = inject(FindService);
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
    if (f && confirm(`Delete "${f.name}"? This cannot be undone.`)) {
      this.findService.delete(f.id);
      this.router.navigate(['/finds']);
    }
  }

  getIcon(f: DetectorFind) { return CATEGORY_ICONS[f.category] ?? '❓'; }
  getCategory(f: DetectorFind) { return CATEGORY_LABELS[f.category] ?? f.category; }
  getMaterial(f: DetectorFind) { return MATERIAL_LABELS[f.material] ?? f.material; }
  getCondition(f: DetectorFind) { return CONDITION_LABELS[f.condition] ?? f.condition; }
}
