import { Component, inject, OnInit, signal } from '@angular/core';
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
  CATEGORY_ICONS,
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
            <!-- Primary fields: name, description, category, tone, value -->
            <section class="form-section">
              <h2 class="section-title">Item Details</h2>

              <div class="form-group">
                <label for="name">Item Name *</label>
                <input id="name" type="text" [(ngModel)]="model.name" name="name" required
                  placeholder="e.g. 1942 Mercury Dime" />
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" [(ngModel)]="model.description" name="description" rows="3"
                  placeholder="What is this item? Any details about it..."></textarea>
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
                  <label for="estimatedValue">Value ($)</label>
                  <input id="estimatedValue" type="number" [(ngModel)]="model.estimatedValue"
                    name="estimatedValue" min="0" step="0.01" placeholder="0.00" />
                </div>
              </div>

              @if (model.category) {
                <div class="xp-preview">
                  {{ getCategoryIcon(model.category) }} {{ getCategoryLabel(model.category) }}
                  — <strong>+{{ getXpForCategory(model.category) }} XP</strong>
                </div>
              }
            </section>

            <!-- Image upload -->
            <section class="form-section">
              <h2 class="section-title">Item Picture</h2>

              <div class="upload-area"
                (click)="fileInput.click()"
                (dragover)="onDragOver($event)"
                (dragleave)="isDragging.set(false)"
                (drop)="onDrop($event)"
                [class.dragging]="isDragging()">

                @if (imagePreview()) {
                  <img [src]="imagePreview()" class="upload-preview" alt="Preview" />
                  <button type="button" class="remove-img" (click)="removeImage($event)">Remove</button>
                } @else {
                  <div class="upload-placeholder">
                    <span class="upload-icon">📷</span>
                    <span class="upload-text">Click or drag a photo here</span>
                    <span class="upload-hint">JPG, PNG, WebP — max 2 MB</span>
                  </div>
                }
              </div>
              <input #fileInput type="file" accept="image/*" style="display:none"
                (change)="onFileSelected($event)" />

              <div class="form-group" style="margin-top:0.5rem">
                <label for="imageUrl">Or paste an image URL</label>
                <input id="imageUrl" type="url" [(ngModel)]="model.imageUrl" name="imageUrl"
                  placeholder="https://..." (ngModelChange)="onUrlChange()" />
              </div>
            </section>

            <!-- Optional extra fields -->
            <section class="form-section">
              <h2 class="section-title">Additional Info <span class="opt-tag">(optional)</span></h2>
              <div class="form-row">
                <div class="form-group">
                  <label for="dateFound">Date Found</label>
                  <input id="dateFound" type="date" [(ngModel)]="model.dateFound" name="dateFound" />
                </div>
                <div class="form-group">
                  <label for="condition">Condition</label>
                  <select id="condition" [(ngModel)]="model.condition" name="condition">
                    @for (opt of conditionOptions; track opt.value) {
                      <option [value]="opt.value">{{ opt.label }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label for="location">Location</label>
                  <input id="location" type="text" [(ngModel)]="model.location" name="location"
                    placeholder="e.g. Beach near pier" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="depth">Depth</label>
                  <div class="input-unit">
                    <input id="depth" type="number" [(ngModel)]="model.depth" name="depth" min="0" step="0.5" placeholder="0" />
                    <select [(ngModel)]="model.depthUnit" name="depthUnit" class="unit">
                      <option value="in">in</option><option value="cm">cm</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label for="weight">Weight</label>
                  <div class="input-unit">
                    <input id="weight" type="number" [(ngModel)]="model.weight" name="weight" min="0" step="0.1" placeholder="0" />
                    <select [(ngModel)]="model.weightUnit" name="weightUnit" class="unit">
                      <option value="g">g</option><option value="oz">oz</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label for="notes">Notes</label>
                <textarea id="notes" [(ngModel)]="model.notes" name="notes" rows="2"
                  placeholder="Any extra notes..."></textarea>
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
    .opt-tag { font-weight: 400; font-size: 0.8rem; color: #94866d; }

    .form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .form-group { flex: 1; min-width: 140px; margin-bottom: 0.65rem; display: flex; flex-direction: column; }

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
      padding: 0.4rem 0.75rem;
      background: #1b1612; border: 1px solid #3e362f;
      color: #b79d7e; font-size: 0.9rem;
    }
    .xp-preview strong { color: #00ff00; }

    /* Image upload area */
    .upload-area {
      border: 2px dashed #94866d;
      background: #f5f0e0;
      padding: 1.25rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s;
      position: relative;
      min-height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    .upload-area:hover, .upload-area.dragging {
      border-color: #936039;
      background: #efe8d4;
    }
    .upload-placeholder {
      display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
    }
    .upload-icon { font-size: 2rem; }
    .upload-text { font-size: 0.9rem; font-weight: 600; color: #605443; }
    .upload-hint { font-size: 0.75rem; color: #94866d; }
    .upload-preview {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
      border: 1px solid #94866d;
    }
    .remove-img {
      margin-top: 0.5rem;
      font-family: var(--font-body); font-size: 0.8rem;
      padding: 0.25rem 0.75rem;
      background: linear-gradient(180deg, #c0392b, #922b21);
      color: #fff; border: 1px solid #6b1a14;
      cursor: pointer;
    }
    .remove-img:hover { filter: brightness(1.15); }

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
  isDragging = signal(false);
  imagePreview = signal<string>('');

  model: Omit<DetectorItem, 'id'> = {
    name: '',
    description: '',
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
        if (existing.imageUrl) {
          this.imagePreview.set(existing.imageUrl);
        }
      }
    }
  }

  getXpForCategory(category: string): number {
    return CATEGORY_XP[category as ItemCategory] ?? 0;
  }

  getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category as ItemCategory] ?? category;
  }

  getCategoryIcon(category: string): string {
    return CATEGORY_ICONS[category as ItemCategory] ?? '❓';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.processFile(input.files[0]);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file?.type.startsWith('image/')) this.processFile(file);
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.model.imageUrl = '';
    this.imagePreview.set('');
  }

  onUrlChange() {
    if (this.model.imageUrl && !this.model.imageUrl.startsWith('data:')) {
      this.imagePreview.set(this.model.imageUrl);
    }
  }

  private processFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.model.imageUrl = dataUrl;
      this.imagePreview.set(dataUrl);
    };
    reader.readAsDataURL(file);
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
