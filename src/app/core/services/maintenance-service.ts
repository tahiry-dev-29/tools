import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private _isMaintenanceMode = signal<boolean>(environment.maintenance || false);

  isMaintenanceMode = computed(() => this._isMaintenanceMode());
  enable() {
    this._isMaintenanceMode.set(true);
  }
  disable() {
    this._isMaintenanceMode.set(false);
  }

  toggle() {
    this._isMaintenanceMode.update(v => !v);
  }
}
