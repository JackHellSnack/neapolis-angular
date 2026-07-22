import { Routes } from '@angular/router';
import { StopMap } from './component/stop-map/stop-map';
import { StopForm } from './component/stop-form/stop-form';
import { LineForm } from './component/line-form/line-form';
import { Login } from './component/login/login';
import { Map } from './component/map/map';

export const routes: Routes = [
  // --- ROTTA DI DEFAULT ---
  {
    path: '',
    redirectTo: 'stop-map',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'stop-map',
    component: StopMap,
    canActivate: []
  },
  {
    path: 'stop-form',
    component: StopForm
  },
  {
    path: 'line-form',
    component: LineForm
  },
  {
    path: 'map',
    component: Map
  }
];