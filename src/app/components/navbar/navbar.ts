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
      <a routerLink="/" class="brand">
        <span class="brand-icon">⛏️</span>
        <span class="brand-text">DetectorLog</span>
      </a>

      <div class="nav-center">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <span class="nav-icon">🏠</span> Dashboard
        </a>
        <a routerLink="/finds" routerLinkActive="active">
          <span class="nav-icon">🎒</span> My Finds
        </a>
        @if (auth.isAdmin()) {
          <a routerLink="/add" routerLinkActive="active" class="btn-add">
            <span class="nav-icon">⚔️</span> Log Find
          </a>
        }
      </div>

      <div class="nav-right">
        <div class="level-badge" title="Metal Detecting Level">
          <span class="level-icon">⛏️</span>
          <span class="level-num">{{ xp.currentLevel() }}</span>
        </div>

        @if (auth.isConfigured()) {
          @if (auth.isLoggedIn()) {
            <div class="user-info">
              @if (auth.photoURL()) {
                <img [src]="auth.photoURL()" class="avatar" alt="avatar" referrerpolicy="no-referrer" />
              }
              <button class="btn-logout" (click)="auth.logout()">Logout</button>
            </div>
          } @else {
            <button class="btn-login" (click)="auth.login()">🔑 Login</button>
          }
        }
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.25rem;
      height: 56px;
      background: linear-gradient(180deg, var(--surface-light) 0%, var(--surface) 40%, var(--surface-dark) 100%);
      border-bottom: 3px solid var(--border);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 0 rgba(0,0,0,0.3);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand {
      display: flex; align-items: center; gap: 0.4rem; text-decoration: none;
    }
    .brand-icon { font-size: 1.3rem; }
    .brand-text {
      font-family: 'Press Start 2P', cursive; font-size: 0.6rem;
      color: var(--gold);
      text-shadow: 2px 2px 0 var(--border), -1px -1px 0 var(--border),
        1px -1px 0 var(--border), -1px 1px 0 var(--border);
    }

    .nav-center {
      display: flex; align-items: center; gap: 0.15rem;
    }
    .nav-center a {
      text-decoration: none; color: var(--text);
      padding: 0.3rem 0.65rem;
      font-size: 1rem; display: flex; align-items: center; gap: 0.25rem;
      border: 2px solid transparent; transition: all 0.15s;
    }
    .nav-icon { font-size: 0.85rem; }
    .nav-center a:hover { background: rgba(0,0,0,0.1); border-color: var(--border-light); }
    .nav-center a.active {
      background: rgba(0,0,0,0.12);
      border: 2px solid var(--border); border-top-color: var(--border-light); border-left-color: var(--border-light);
      box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2);
    }
    .btn-add {
      background: linear-gradient(180deg, #4caf50 0%, #2d8c3e 100%) !important;
      color: var(--text-light) !important;
      border: 2px solid #1a5c1a !important; border-top-color: #6fcf6f !important; border-left-color: #6fcf6f !important;
      box-shadow: 2px 2px 0 rgba(0,0,0,0.3); text-shadow: 1px 1px 0 rgba(0,0,0,0.4);
    }
    .btn-add:hover { filter: brightness(1.1); }

    .nav-right { display: flex; align-items: center; gap: 0.5rem; }

    .level-badge {
      display: flex; align-items: center; gap: 0.25rem;
      background: linear-gradient(180deg, #3a3a2a, #2a2a1a);
      border: 2px solid var(--border); border-top-color: #5a5a4a; border-left-color: #5a5a4a;
      padding: 0.2rem 0.5rem;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.4);
    }
    .level-icon { font-size: 0.85rem; }
    .level-num {
      font-family: 'Press Start 2P', cursive; font-size: 0.55rem;
      color: var(--gold); text-shadow: 1px 1px 0 #000;
    }

    .user-info { display: flex; align-items: center; gap: 0.4rem; }
    .avatar {
      width: 28px; height: 28px; border-radius: 0;
      border: 2px solid var(--border);
    }
    .btn-login, .btn-logout {
      font-family: inherit; font-size: 0.9rem; cursor: pointer;
      padding: 0.25rem 0.6rem;
      border: 2px solid var(--border); border-top-color: var(--border-light); border-left-color: var(--border-light);
      background: linear-gradient(180deg, var(--surface-light), var(--surface-dark));
      color: var(--text); box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
      transition: filter 0.15s;
    }
    .btn-login:hover, .btn-logout:hover { filter: brightness(1.05); }

    @media (max-width: 640px) {
      .navbar { padding: 0 0.5rem; gap: 0.25rem; }
      .brand-text { display: none; }
      .nav-center a { padding: 0.25rem 0.4rem; font-size: 0.85rem; }
      .nav-center a span:last-child { display: none; }
    }
  `,
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly xp = inject(XpService);
}
