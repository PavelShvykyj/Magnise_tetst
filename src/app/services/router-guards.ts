import { inject } from '@angular/core';
import { AuthStateService } from './auth-state.service';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const LoggedInAuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean>  => {
  const router: Router = inject(Router);
  const auth: AuthStateService = inject(AuthStateService);
  if (!auth.token) {
    router.navigate(['/login'])
  }
  return of(!!auth.token)
}
