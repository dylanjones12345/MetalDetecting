import { Injectable, signal, computed } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private provider = new GoogleAuthProvider();
  private readonly firebaseReady = signal(false);

  private readonly userSignal = signal<User | null>(null);
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !this.firebaseReady() || !!this.userSignal());
  readonly isAdmin = computed(() => {
    if (!this.firebaseReady()) return true;
    const u = this.userSignal();
    return !!u && u.email === environment.adminEmail;
  });
  readonly displayName = computed(() => this.userSignal()?.displayName ?? '');
  readonly photoURL = computed(() => this.userSignal()?.photoURL ?? '');
  readonly isConfigured = signal(false);

  constructor() {
    this.initFirebase();
  }

  private initFirebase() {
    const cfg = environment.firebase;
    if (!cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') {
      this.firebaseReady.set(false);
      return;
    }
    try {
      this.app = initializeApp(cfg);
      this.auth = getAuth(this.app);
      this.firebaseReady.set(true);
      this.isConfigured.set(true);

      onAuthStateChanged(this.auth, (user) => {
        this.userSignal.set(user);
      });
    } catch (e) {
      console.error('Firebase init failed:', e);
      this.firebaseReady.set(false);
    }
  }

  async login(): Promise<void> {
    if (!this.auth) return;
    try {
      await signInWithPopup(this.auth, this.provider);
    } catch (e) {
      console.error('Login failed:', e);
    }
  }

  async logout(): Promise<void> {
    if (!this.auth) return;
    try {
      await signOut(this.auth);
    } catch (e) {
      console.error('Logout failed:', e);
    }
  }
}
