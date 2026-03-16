import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FindService } from '../../services/find.service';
import {
  DetectorFind,
  FindCategory,
  FindMaterial,
  FindCondition,
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
        <h1>{{ isEditing ? 'Edit Find' : 'Log a New Find' }}</h1>
        <p>{{ isEditing ? 'Update the details below.' : 'Record the details of your latest discovery.' }}</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="find-form" #findForm="ngForm">
        <div class="form-section">
          <h2>Basic Info</h2>
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

        <div class="form-section">
          <h2>Measurements</h2>
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
              <label for="estimatedValue">Est. Value ($)</label>
              <input id="estimatedValue" type="number" [(ngModel)]="model.estimatedValue"
                name="estimatedValue" min="0" step="0.01" placeholder="0.00" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Location & Notes</h2>
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
            {{ isEditing ? 'Save Changes' : 'Log Find' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .form-page { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .form-header { margin-bottom: 2rem; }
    .form-header h1 {
      font-size: 1.75rem;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .form-header p { color: var(--text-muted); margin-top: 0.25rem; }

    .find-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
    }
    .form-section h2 { font-size: 1rem; color: var(--gold); margin-bottom: 1rem; }
    .form-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .flex-1 { flex: 1; min-width: 150px; }
    .flex-2 { flex: 2; min-width: 200px; }

    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; }
    .form-group label {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
      font-weight: 500;
    }
    input, select, textarea {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--gold);
    }
    textarea { resize: vertical; }

    .input-with-unit { display: flex; gap: 0.5rem; }
    .input-with-unit input { flex: 1; }
    .unit-select { width: 90px; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 0.5rem;
    }
    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.75rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--gold), var(--gold-dark));
      color: var(--bg);
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-secondary { background: var(--surface-hover); color: var(--text); }
    .btn-secondary:hover { background: var(--border); }

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
