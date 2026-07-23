import { Routes } from '@angular/router';
import { Home } from './component/home/home';
import { StopMap } from './component/stop-map/stop-map';
import { StopForm } from './component/stop-form/stop-form';
import { LineForm } from './component/line-form/line-form';
import { Login } from './component/login/login';
import { RideSearchForm } from './component/ride-search-form/ride-search-form';
import { PoiForm } from './component/poi-form/poi-form';
import { PoiSearchForm } from './component/poi-search-form/poi-search-form';
import { UserDashboard } from './component/user-dashboard/user-dashboard';
import { AdminDashboard } from './component/admin-dashboard/admin-dashboard';
import { adminGuard } from './guard/admin-guard';
import { authGuard } from './guard/auth-guard';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'stop-map', component: StopMap },
  { path: 'ride-search', component: RideSearchForm },
  { path: 'poi-search', component: PoiSearchForm },
  { path: 'dashboard', component: UserDashboard, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboard, canActivate: [authGuard, adminGuard] },
  { path: 'stop-form', component: StopForm, canActivate: [authGuard, adminGuard] },
  { path: 'line-form', component: LineForm, canActivate: [authGuard, adminGuard] },
  { path: 'poi-form', component: PoiForm, canActivate: [authGuard, adminGuard] },
];
