import { Routes } from '@angular/router';
import { StopMap } from './component/stop-map/stop-map';

export const routes: Routes = [
  // --- ROTTA DI DEFAULT (Reindirizza alla lista stazioni all'avvio) ---
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  // --- ROTTE PER LE STAZIONI ---
  { 
    path: 'test', 
    component: StopMap,
    canActivate:[]
  }
];