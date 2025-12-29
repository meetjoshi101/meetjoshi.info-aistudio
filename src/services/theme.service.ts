import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Always false, logic removed. Kept for API compatibility if needed.
  darkMode = signal<boolean>(false);

  constructor() {
    // Ensure cleanup of any previous dark mode state
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('theme');
    }
  }

  toggle() {
    // No-op
  }
}