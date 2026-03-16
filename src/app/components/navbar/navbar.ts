import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <span class="nav-icon">🏠</span> Dashboard
        </a>
        <a routerLink="/finds" routerLinkActive="active">
          <span class="nav-icon">🎒</span> My Finds
        </a>
        <a routerLink="/add" routerLinkActive="active" class="btn-add">
          <span class="nav-icon">⚔️</span> Log Find
        </a>
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 56px;
      background: linear-gradient(180deg, var(--surface-light) 0%, var(--surface) 40%, var(--surface-dark) 100%);
      border-bottom: 3px solid var(--border);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.2),
        0 3px 0 rgba(0,0,0,0.3);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }
    .brand-icon { font-size: 1.3rem; }
    .brand-text {
      font-family: 'Press Start 2P', cursive;
      font-size: 0.7rem;
      color: var(--gold);
      text-shadow: 2px 2px 0 var(--border), -1px -1px 0 var(--border),
        1px -1px 0 var(--border), -1px 1px 0 var(--border);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.15rem;
    }
    .nav-links a {
      text-decoration: none;
      color: var(--text);
      padding: 0.35rem 0.75rem;
      border-radius: 0;
      font-weight: 500;
      font-size: 1rem;
      transition: all 0.15s;
      border: 2px solid transparent;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .nav-icon { font-size: 0.9rem; }
    .nav-links a:hover {
      background: rgba(0,0,0,0.1);
      border-color: var(--border-light);
    }
    .nav-links a.active {
      color: var(--text);
      background: rgba(0,0,0,0.12);
      border: 2px solid var(--border);
      border-top-color: var(--border-light);
      border-left-color: var(--border-light);
      box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2);
    }
    .btn-add {
      background: linear-gradient(180deg, #4caf50 0%, #2d8c3e 100%) !important;
      color: var(--text-light) !important;
      border: 2px solid #1a5c1a !important;
      border-top-color: #6fcf6f !important;
      border-left-color: #6fcf6f !important;
      box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
      text-shadow: 1px 1px 0 rgba(0,0,0,0.4);
    }
    .btn-add:hover {
      filter: brightness(1.1);
    }

    @media (max-width: 600px) {
      .navbar { padding: 0 0.75rem; }
      .brand-text { display: none; }
      .nav-links a { padding: 0.35rem 0.5rem; font-size: 0.85rem; }
    }
  `,
})
export class NavbarComponent {}
