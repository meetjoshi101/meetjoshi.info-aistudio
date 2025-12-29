import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, RouterLink, RouterLinkActive]
})
export class AppComponent {
  isMenuOpen = signal(false);

  links = [
    { path: '/', label: 'Overview' },
    { path: '/projects', label: 'Selected Works' },
    { path: '/blog', label: 'Journal' },
    { path: '/about', label: 'Profile' },
    { path: '/contact', label: 'Inquiries' }
  ];

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }
}