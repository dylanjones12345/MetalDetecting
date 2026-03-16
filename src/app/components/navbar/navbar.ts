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
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
        <a routerLink="/finds" routerLinkActive="active">My Finds</a>
        <a routerLink="/add" routerLinkActive="active" class="btn-add">+ Log Find</a>
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 64px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--text);
      font-weight: 700;
      font-size: 1.25rem;
    }
    .brand-icon { font-size: 1.5rem; }
    .brand-text {
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .nav-links a {
      text-decoration: none;
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .nav-links a:hover { color: var(--text); background: var(--surface-hover); }
    .nav-links a.active { color: var(--gold); background: var(--surface-hover); }
    .btn-add {
      background: linear-gradient(135deg, var(--gold), var(--gold-dark)) !important;
      color: var(--bg) !important;
      font-weight: 600 !important;
      padding: 0.5rem 1.25rem !important;
    }
    .btn-add:hover { opacity: 0.9; transform: translateY(-1px); }

    @media (max-width: 600px) {
      .navbar { padding: 0 1rem; }
      .brand-text { display: none; }
      .nav-links a { padding: 0.5rem 0.75rem; font-size: 0.8rem; }
    }
  `,
})
export class NavbarComponent {}
