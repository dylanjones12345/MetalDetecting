import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/find.service';
import { AuthService } from '../../services/auth.service';
import {
  DetectorItem,
  CATEGORY_LABELS,
  CONDITION_LABELS,
  TONE_LABELS,
  CATEGORY_XP,
  ItemCategory,
} from '../../models/find.model';

@Component({
  selector: 'app-find-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (!auth.isAdmin()) {
      <div class="page">
        <div class="content" style="text-align:center;padding:3rem">
          <h2>Admin Only</h2>
          <p style="color:#777;margin-top:0.5rem">You must be logged in as admin to log items.</p>
        </div>
      </div>
    } @else {
      <div class="page">
        <div class="content">
          <h1 class="page-title">{{ isEditing ? 'Edit Item' : 'Log a New Item' }}</h1>
          <p class="page-sub">{{ isEditing ? 'Update the details below.' : 'Record your latest discovery.' }}</p>

          <form (ngSubmit)="onSubmit()" class="item-form" #itemForm="ngForm">
            <section class="form-section">
              <h2 class="section-title">Basic Info</h2>
              <div class="form-row">
                <div class="form-group grow-2">
                  <label for="name">Name / Description *</label>
                  <input id="name" type="text" [(ngModel)]="model.name" name="name" required
                    placeholder="e.g. 1942 Mercury Dime" />
                </div>
                <div class="form-group">
                  <label for="dateFound">Date Found *</label>
                  <input id="dateFound" type="date" [(ngModel)]="model.dateFound" name="dateFound" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="category">Category *</label>
                  <select id="category" [(ngModel)]="model.category" name="category" required>
                    @for (opt of categoryOptions; track opt.value) {
                      <option [value]="opt.value">{{ opt.label }} (+{{ opt.xp }} xp)</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label for="tone">Detector Tone</label>
                  <select id="tone" [(ngModel)]="model.tone" name="tone">
                    @for (opt of toneOptions; track opt.value) {
                      <option [value]="opt.value">{{ opt.label }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label for="condition">Condition</label>
                  <select id="condition" [(ngModel)]="model.condition" name="condition">
                    @for (opt of conditionOptions; track opt.value) {
                      <option [value]="opt.value">{{ opt.label }}</option>
                    }
                  </select>
                </div>
              </div>
              @if (model.category) {
                <div class="xp-preview">
                  XP Reward: <strong>+{{ getXpForCategory(model.category) }}</strong>
                </div>
              }
            </section>

            <section class="form-section">
              <h2 class="section-title">Measurements</h2>
              <div class="form-row">
                <div class="form-group">
                  <label for="depth">Depth</label>
                  <div class="input-unit">
                    <input id="depth" type="number" [(ngModel)]="model.depth" name="depth" min="0" step="0.5" placeholder="0" />
                    <select [(ngModel)]="model.depthUnit" name="depthUnit" class="unit">
                      <option value="in">in</option>
                      <option value="cm">cm</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label for="weight">Weight</label>
                  <div class="input-unit">
                    <input id="weight" type="number" [(ngModel)]="model.weight" name="weight" min="0" step="0.1" placeholder="0" />
                    <select [(ngModel)]="model.weightUnit" name="weightUnit" class="unit">
                      <option value="g">g</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label for="estimatedValue">Est. Value ($)</label>
                  <input id="estimatedValue" type="number" [(ngModel)]="model.estimatedValue" name="estimatedValue" min="0" step="0.01" placeholder="0.00" />
                </div>
              </div>
            </section>

            <section class="form-section">
              <h2 class="section-title">Location & Notes</h2>
              <div class="form-group">
                <label for="location">Location</label>
                <input id="location" type="text" [(ngModel)]="model.location" name="location" placeholder="e.g. Old farmstead on Route 7" />
              </div>
              <div class="form-group">
                <label for="imageUrl">Image URL</label>
                <input id="imageUrl" type="url" [(ngModel)]="model.imageUrl" name="imageUrl" placeholder="https://..." />
              </div>
              <div class="form-group">
                <label for="notes">Notes</label>
                <textarea id="notes" [(ngModel)]="model.notes" name="notes" rows="4" placeholder="Extra details..."></textarea>
              </div>
            </section>

            <div class="form-actions">
              <button type="button" class="osrs-btn" (click)="onCancel()">Cancel</button>
              <button type="submit" class="osrs-btn osrs-btn-primary" [disabled]="itemForm.invalid">
                {{ isEditing ? 'Save Changes' : 'Log Item' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: `
    .page { position: relative; z-index: 1; }
    .content { max-width: 800px; margin: 0 auto; padding: 1.25rem 1rem 3rem; }

    .page-title {
      font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700;
      color: #18140c; margin-bottom: 0.25rem;
    }
    .page-sub { color: #777; margin-bottom: 1.25rem; }

    .item-form { display: flex; flex-direction: column; gap: 1rem; }

    .form-section {
      background: var(--body-main, #e2dbc8);
      border: 2px solid var(--body-border, #94866d);
      padding: 1rem;
    }
    .section-title {
      font-family: var(--font-heading);
      font-size: 1rem; font-weight: 700; color: #3c352a;
      border-bottom: 1px solid #b8a282;
      padding-bottom: 0.3rem; margin-bottom: 0.75rem;
    }

    .form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .form-group { flex: 1; min-width: 140px; margin-bottom: 0.65rem; display: flex; flex-direction: column; }
    .grow-2 { flex: 2; min-width: 200px; }

    label {
      font-size: 0.8rem; font-weight: 600; color: #605443;
      margin-bottom: 0.2rem;
    }
    input, select, textarea {
      font-family: var(--font-body); font-size: 0.875rem;
      padding: 0.4rem 0.6rem;
      border: 2px solid #94866d; background: #f9f6ef; color: #333;
    }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #936039; }
    textarea { resize: vertical; }

    .input-unit { display: flex; gap: 0.35rem; }
    .input-unit input { flex: 1; }
    .unit { width: 60px; }

    .xp-preview {
      display: inline-block;
      padding: 0.35rem 0.65rem;
      background: #1b1612; border: 1px solid #3e362f;
      color: #b79d7e; font-size: 0.85rem;
    }
    .xp-preview strong { color: #00ff00; }

    .form-actions {
      display: flex; justify-content: flex-end; gap: 0.5rem;
    }

    @media (max-width: 600px) {
      .content { padding: 1rem 0.75rem; }
      .form-row { flex-direction: column; }
    }
  `,
})
export class FindFormComponent implements OnInit {
  private itemService = inject(ItemService);
  protected auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditing = false;
  editId = '';

  model: Omit<DetectorItem, 'id'> = {
    name: '',
    category: 'coin',
    tone: 'mid',
    dateFound: new Date().toISOString().split('T')[0],
    location: '',
    depth: 0,
    depthUnit: 'in',
    condition: 'good',
    estimatedValue: 0,
    weight: 0,
    weightUnit: 'g',
    notes: '',
    imageUrl: '',
  };

  categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value, label, xp: CATEGORY_XP[value as ItemCategory],
  }));
  toneOptions = Object.entries(TONE_LABELS).map(([value, label]) => ({ value, label }));
  conditionOptions = Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label }));

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.itemService.getById(id);
      if (existing) {
        this.isEditing = true;
        this.editId = id;
        this.model = { ...existing };
      }
    }
  }

  getXpForCategory(category: string): number {
    return CATEGORY_XP[category as ItemCategory] ?? 0;
  }

  onSubmit() {
    if (this.isEditing) {
      this.itemService.update(this.editId, this.model);
    } else {
      this.itemService.add(this.model);
    }
    this.router.navigate(['/items']);
  }

  onCancel() {
    this.router.navigate([this.isEditing ? '/items' : '/']);
  }
}
