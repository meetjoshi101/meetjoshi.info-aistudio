import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, RouterLink, RouterLinkActive]
})
export class AppComponent {
  private router = inject(Router);
  private location = inject(Location);
  
  isMenuOpen = signal(false);
  isAdminPage = signal(false);

  links = [
    { path: '/', label: 'Overview' },
    { path: '/projects', label: 'Selected Works' },
    { path: '/blog', label: 'Journal' },
    { path: '/about', label: 'Profile' },
    { path: '/contact', label: 'Inquiries' }
  ];

  constructor() {
    this.isAdminPage.set(this.location.path().startsWith('/admin') || this.location.path().startsWith('/login'));
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isAdminPage.set(url.startsWith('/admin') || url.startsWith('/login'));
    });
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }
}
