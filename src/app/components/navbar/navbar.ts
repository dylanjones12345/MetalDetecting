import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { XpService } from '../../services/xp.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <a routerLink="/" class="brand">
          <span class="brand-icon">⛏️</span>
          <span class="brand-text">DetectorLog</span>
        </a>

        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Dashboard
          </a>
          <a routerLink="/items" routerLinkActive="active">Items</a>
          <a routerLink="/wiki" routerLinkActive="active">Wiki</a>
          @if (auth.isAdmin()) {
            <a routerLink="/add" routerLinkActive="active" class="nav-log">Log Item</a>
          }
        </div>

        <div class="nav-right">
          <div class="level-badge" title="Metal Detecting Level">
            <span class="level-label">Lvl</span>
            <span class="level-num">{{ xp.currentLevel() }}</span>
          </div>

          @if (auth.isConfigured()) {
            @if (auth.isLoggedIn()) {
              <div class="user-info">
                @if (auth.photoURL()) {
                  <img [src]="auth.photoURL()" class="avatar" alt="" referrerpolicy="no-referrer" />
                }
                <button class="osrs-btn" (click)="auth.logout()">Logout</button>
              </div>
            } @else {
              <button class="osrs-btn" (click)="auth.login()">Log in</button>
            }
          }
        </div>
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      background: linear-gradient(180deg, #4a3d2e, var(--btn-dark, #18140c));
      border-bottom: 3px solid #0d0a06;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      height: 52px;
    }

    .brand {
      display: flex; align-items: center; gap: 0.4rem;
      text-decoration: none;
    }
    .brand-icon { font-size: 1.2rem; }
    .brand-text {
      font-family: var(--font-heading, 'PT Serif', serif);
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffd700;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    }

    .nav-links {
      display: flex; align-items: center; gap: 0.15rem;
    }
    .nav-links a {
      text-decoration: none;
      color: #c0a886;
      padding: 0.4rem 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s;
      border-bottom: 2px solid transparent;
    }
    .nav-links a:hover {
      color: #ffd700;
      background: rgba(255,255,255,0.05);
    }
    .nav-links a.active {
      color: #ffd700;
      border-bottom-color: #ffd700;
      background: rgba(255,215,0,0.08);
    }
    .nav-log {
      background: linear-gradient(180deg, #4a8c3e, #2d6b25) !important;
      color: #fff !important;
      border: 1px solid #1a4a12 !important;
      border-bottom: 1px solid #1a4a12 !important;
      padding: 0.3rem 0.7rem !important;
      margin-left: 0.25rem;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
    }
    .nav-log:hover { filter: brightness(1.15); }
    .nav-log.active { border-bottom-color: #1a4a12 !important; }

    .nav-right { display: flex; align-items: center; gap: 0.5rem; }

    .level-badge {
      display: flex; align-items: center; gap: 0.25rem;
      background: rgba(0,0,0,0.35);
      border: 1px solid #4a3d2e;
      padding: 0.2rem 0.5rem;
      border-radius: 2px;
    }
    .level-label { font-size: 0.7rem; color: #94866d; }
    .level-num {
      font-family: var(--font-heading, 'PT Serif', serif);
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffd700;
      text-shadow: 1px 1px 0 #000;
    }

    .user-info { display: flex; align-items: center; gap: 0.35rem; }
    .avatar {
      width: 26px; height: 26px;
      border: 1px solid #4a3d2e;
      border-radius: 2px;
    }

    @media (max-width: 640px) {
      .nav-inner { padding: 0 0.5rem; }
      .brand-text { display: none; }
      .nav-links a { padding: 0.35rem 0.45rem; font-size: 0.8rem; }
    }
  `,
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly xp = inject(XpService);
}
