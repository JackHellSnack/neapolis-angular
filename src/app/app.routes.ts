import { Routes } from '@angular/router';
import { Home } from './component/home/home';
import { StopMap } from './component/stop-map/stop-map';
import { StopForm } from './component/stop-form/stop-form';
import { LineForm } from './component/line-form/line-form';
import { Login } from './component/login/login';
import { Map } from './component/map/map';
import { RideSearchForm } from './component/ride-search-form/ride-search-form';
import { PoiForm } from './component/poi-form/poi-form';
export const routes: Routes = [
  // --- ROTTA DI DEFAULT ---
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: Home
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
  },
  {
    path: 'ride-search',
    component: RideSearchForm
  },
  {
    path: 'poi-form',
    component: PoiForm
  }
];