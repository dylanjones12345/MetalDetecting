import { Injectable, signal } from '@angular/core';

const TRACKS = [
  { name: 'Sea Shanty 2', src: 'audio/sea-shanty-2.ogg' },
  { name: 'Sea Shanty', src: 'audio/sea-shanty.ogg' },
];

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private trackIndex = 0;

  readonly isPlaying = signal(false);
  readonly currentTrack = signal(TRACKS[0].name);
  readonly volume = signal(0.3);

  init(): void {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.volume = this.volume();
    this.audio.loop = false;
    this.audio.addEventListener('ended', () => this.playNext());
    this.loadTrack(0);
    this.tryAutoplay();
  }

  toggle(): void {
    if (!this.audio) this.init();
    if (this.isPlaying()) {
      this.audio!.pause();
      this.isPlaying.set(false);
    } else {
      this.audio!.play().then(() => this.isPlaying.set(true)).catch(() => {});
    }
  }

  setVolume(v: number): void {
    this.volume.set(v);
    if (this.audio) this.audio.volume = v;
  }

  private loadTrack(index: number): void {
    this.trackIndex = index % TRACKS.length;
    const track = TRACKS[this.trackIndex];
    this.currentTrack.set(track.name);
    if (this.audio) {
      this.audio.src = track.src;
      this.audio.load();
    }
  }

  private playNext(): void {
    this.loadTrack(this.trackIndex + 1);
    this.audio?.play().catch(() => {});
  }

  private tryAutoplay(): void {
    if (!this.audio) return;
    this.audio.play()
      .then(() => this.isPlaying.set(true))
      .catch(() => {
        const resume = () => {
          this.audio?.play()
            .then(() => {
              this.isPlaying.set(true);
              document.removeEventListener('click', resume);
              document.removeEventListener('keydown', resume);
            })
            .catch(() => {});
        };
        document.addEventListener('click', resume, { once: false });
        document.addEventListener('keydown', resume, { once: false });
      });
  }
}
