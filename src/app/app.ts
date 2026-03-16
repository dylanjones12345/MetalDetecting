import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar';
import { AudioService } from './services/audio.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FormsModule],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>

    <!-- Beach decorations -->
    <img src="img/sand-crab.png" class="crab-left" alt="" />
    <img src="img/sand-crab.png" class="crab-right" alt="" />
    <img src="img/palm-tree.png" class="palm-left" alt="" />
    <img src="img/palm-tree.png" class="palm-right" alt="" />

    <!-- Music player -->
    <div class="music-bar">
      <button (click)="audio.toggle()" [title]="audio.isPlaying() ? 'Pause' : 'Play'">
        {{ audio.isPlaying() ? '⏸' : '▶️' }}
      </button>
      <span class="track-name">{{ audio.currentTrack() }}</span>
      <input type="range" min="0" max="1" step="0.05"
        [ngModel]="audio.volume()"
        (ngModelChange)="audio.setVolume($event)" />
    </div>
  `,
  styles: `
    main {
      min-height: calc(100vh - 56px);
      padding-bottom: 60px;
    }
  `,
})
export class App implements OnInit {
  protected readonly audio = inject(AudioService);

  ngOnInit() {
    this.audio.init();
  }
}
