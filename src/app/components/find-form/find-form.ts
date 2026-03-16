import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FindService } from '../../services/find.service';
import {
  DetectorFind,
  CATEGORY_LABELS,
  MATERIAL_LABELS,
  CONDITION_LABELS,
} from '../../models/find.model';

@Component({
  selector: 'app-find-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="form-page">
      <div class="form-header">
        <h1 class="osrs-heading">{{ isEditing ? '📝 Edit Find' : '⚔️ Log a New Find' }}</h1>
        <p>{{ isEditing ? 'Update the details below.' : 'Record the details of your latest discovery, adventurer!' }}</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="find-form" #findForm="ngForm">
        <div class="form-section osrs-panel">
          <h2>🏷️ Basic Info</h2>
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="name">Name / Description *</label>
              <input id="name" type="text" [(ngModel)]="model.name" name="name" required
                placeholder="e.g. 1942 Mercury Dime" />
            </div>
            <div class="form-group flex-1">
              <label for="dateFound">Date Found *</label>
              <input id="dateFound" type="date" [(ngModel)]="model.dateFound" name="dateFound" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label for="category">Category *</label>
              <select id="category" [(ngModel)]="model.category" name="category" required>
                @for (opt of categoryOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>
            <div class="form-group flex-1">
              <label for="material">Material *</label>
              <select id="material" [(ngModel)]="model.material" name="material" required>
                @for (opt of materialOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>
            <div class="form-group flex-1">
              <label for="condition">Condition</label>
              <select id="condition" [(ngModel)]="model.condition" name="condition">
                @for (opt of conditionOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <div class="form-section osrs-panel">
          <h2>📏 Measurements</h2>
          <div class="form-row">
            <div class="form-group flex-1">
              <label for="depth">Depth</label>
              <div class="input-with-unit">
                <input id="depth" type="number" [(ngModel)]="model.depth" name="depth"
                  min="0" step="0.5" placeholder="0" />
                <select [(ngModel)]="model.depthUnit" name="depthUnit" class="unit-select">
                  <option value="in">inches</option>
                  <option value="cm">cm</option>
                </select>
              </div>
            </div>
            <div class="form-group flex-1">
              <label for="weight">Weight</label>
              <div class="input-with-unit">
                <input id="weight" type="number" [(ngModel)]="model.weight" name="weight"
                  min="0" step="0.1" placeholder="0" />
                <select [(ngModel)]="model.weightUnit" name="weightUnit" class="unit-select">
                  <option value="g">grams</option>
                  <option value="oz">oz</option>
                </select>
              </div>
            </div>
            <div class="form-group flex-1">
              <label for="estimatedValue">Est. Value (gp) 💰</label>
              <input id="estimatedValue" type="number" [(ngModel)]="model.estimatedValue"
                name="estimatedValue" min="0" step="0.01" placeholder="0.00" />
            </div>
          </div>
        </div>

        <div class="form-section osrs-panel">
          <h2>🗺️ Location & Notes</h2>
          <div class="form-group">
            <label for="location">Location</label>
            <input id="location" type="text" [(ngModel)]="model.location" name="location"
              placeholder="e.g. Old farmstead on Route 7" />
          </div>
          <div class="form-group">
            <label for="imageUrl">Image URL</label>
            <input id="imageUrl" type="url" [(ngModel)]="model.imageUrl" name="imageUrl"
              placeholder="https://..." />
          </div>
          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea id="notes" [(ngModel)]="model.notes" name="notes" rows="4"
              placeholder="Any extra details about this find..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="findForm.invalid">
            {{ isEditing ? '💾 Save Changes' : '✅ Log Find' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .form-page { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
    .form-header { margin-bottom: 1.5rem; text-align: center; }
    .form-header h1 { font-size: 0.7rem; margin-bottom: 0.4rem; }
    .form-header p { color: var(--text-muted); }

    .find-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-section { padding: 1.25rem; }
    .form-section h2 {
      font-size: 1.1rem; color: var(--text); margin-bottom: 0.85rem;
      border-bottom: 2px solid var(--border-light); padding-bottom: 0.35rem;
    }
    .form-row { display: flex; gap: 0.85rem; flex-wrap: wrap; }
    .flex-1 { flex: 1; min-width: 150px; }
    .flex-2 { flex: 2; min-width: 200px; }

    .form-group { margin-bottom: 0.85rem; display: flex; flex-direction: column; }
    .form-group label {
      font-size: 0.9rem; color: var(--text-muted);
      margin-bottom: 0.3rem; font-weight: 500;
    }
    input, select, textarea {
      background: var(--surface-light);
      border: 2px solid var(--border);
      border-bottom-color: var(--border-light);
      border-right-color: var(--border-light);
      color: var(--text);
      padding: 0.5rem 0.7rem;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.15s;
      box-shadow: inset 1px 1px 2px rgba(0,0,0,0.15);
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--gold-dark);
      box-shadow: inset 1px 1px 2px rgba(0,0,0,0.15), 0 0 0 1px var(--gold-dark);
    }
    textarea { resize: vertical; }
    select { cursor: pointer; }

    .input-with-unit { display: flex; gap: 0.4rem; }
    .input-with-unit input { flex: 1; }
    .unit-select { width: 90px; }

    .form-actions {
      display: flex; justify-content: flex-end; gap: 0.6rem; padding-top: 0.25rem;
    }
    .btn-primary, .btn-secondary {
      padding: 0.6rem 1.5rem; font-weight: 600; font-size: 1rem;
      cursor: pointer; font-family: inherit; transition: filter 0.15s;
    }
    .btn-primary {
      background: linear-gradient(180deg, #4caf50 0%, #2d8c3e 100%);
      color: var(--text-light);
      border: 2px solid #1a5c1a; border-top-color: #6fcf6f; border-left-color: #6fcf6f;
      box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
      text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
    }
    .btn-primary:hover:not(:disabled) { filter: brightness(1.1); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; filter: saturate(0.3); }
    .btn-secondary {
      background: linear-gradient(180deg, var(--surface-light), var(--surface-dark));
      color: var(--text); border: 2px solid var(--border);
      border-top-color: var(--border-light); border-left-color: var(--border-light);
      box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
    }
    .btn-secondary:hover { filter: brightness(1.05); }

    @media (max-width: 600px) {
      .form-page { padding: 1rem; }
      .form-row { flex-direction: column; }
    }
  `,
})
export class FindFormComponent implements OnInit {
  private findService = inject(FindService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditing = false;
  editId = '';

  model: Omit<DetectorFind, 'id'> = {
    name: '',
    category: 'coin',
    material: 'copper',
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

  categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
  materialOptions = Object.entries(MATERIAL_LABELS).map(([value, label]) => ({ value, label }));
  conditionOptions = Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label }));

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.findService.getById(id);
      if (existing) {
        this.isEditing = true;
        this.editId = id;
        this.model = { ...existing };
      }
    }
  }

  onSubmit() {
    if (this.isEditing) {
      this.findService.update(this.editId, this.model);
    } else {
      this.findService.add(this.model);
    }
    this.router.navigate(['/finds']);
  }

  onCancel() {
    this.router.navigate([this.isEditing ? '/finds' : '/']);
  }
}
