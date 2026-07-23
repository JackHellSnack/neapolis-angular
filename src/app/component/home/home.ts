import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StopMap } from '../stop-map/stop-map';
import { RideSearchForm } from '../ride-search-form/ride-search-form';
import { PoiSearchForm } from '../poi-search-form/poi-search-form';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,  StopMap, RideSearchForm, PoiSearchForm],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  activeTab = signal<'ride' | 'poi'>('ride');
  setTab(tab: 'ride' | 'poi') { this.activeTab.set(tab); }
  
}
