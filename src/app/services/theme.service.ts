import { Injectable, signal, computed, effect } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'kent-theme-preference';

  public theme = signal<AppTheme>(this.getInitialTheme());
  public isDark = computed(() => this.theme() === 'dark');

  constructor() {
    // Synchronize document attribute on signal changes
    effect(() => {
      const current = this.theme();
      document.documentElement.setAttribute('data-theme', current);
      try {
        localStorage.setItem(this.storageKey, current);
      } catch (e) {
        // Handle private browsing or restricted localStorage
        console.warn('Could not persist theme preference', e);
      }
    });
  }

  public toggleTheme(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  public setTheme(theme: AppTheme): void {
    this.theme.set(theme);
  }

  private getInitialTheme(): AppTheme {
    try {
      const saved = localStorage.getItem(this.storageKey) as AppTheme | null;
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // Local storage not accessible
    }

    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      return 'light';
    }

    return 'dark';
  }
}
