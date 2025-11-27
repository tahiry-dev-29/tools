import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MaintenanceService } from '../services/maintenance-service';

export const maintenanceGuard: CanActivateFn = (route, state) => {
  const maintenanceService = inject(MaintenanceService);
  const router = inject(Router);

  if (maintenanceService.isMaintenanceMode()) {
    if (state.url === '/maintenance') {
      return true;
    }
    return router.createUrlTree(['/maintenance']);
  }

  if (state.url === '/maintenance') {
    return router.createUrlTree(['/']);
  }

  return true;
};
