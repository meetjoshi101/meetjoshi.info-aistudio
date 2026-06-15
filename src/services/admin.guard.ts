import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, first } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private ready$ = toObservable(this.authService.ready);

  canActivate() {
    return this.ready$.pipe(
      filter(ready => ready),
      first(),
      map(() => {
        if (this.authService.isAdmin()) {
          return true;
        }
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
