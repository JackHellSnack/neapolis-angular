import { Component } from '@angular/core';
import { StopMap } from '../stop-map/stop-map';
import { FloatingMenu } from '../floating-menu/floating-menu';
import { SquircleDirective } from "../../directive/squircle";
import { AdminDashboard } from "../admin-dashboard/admin-dashboard";

@Component({
  selector: 'app-home-map',
  imports: [StopMap, FloatingMenu, SquircleDirective, AdminDashboard],
  templateUrl: './home-map.html',
  styleUrl: './home-map.css',
})
export class HomeMap {}
