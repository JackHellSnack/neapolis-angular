import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LinePicker } from '../line-picker/line-picker';
import { StopPicker } from '../stop-picker/stop-picker';

import Line from '../../model/line';
import Stop from '../../model/stop';
import RouteLeg from '../../model/route-leg';
import RideSearchRequest from '../../model/ride-search-request';
import { RideService } from '../../service/ride-service';
import { RouteHighlightService } from '../../service/route-highlight-service';

@Component({
  selector: 'app-ride-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LinePicker, StopPicker],
  templateUrl: './ride-search-form.html',
  styleUrls: ['./ride-search-form.css']
})
export class RideSearchForm {
  private rideService = inject(RideService);
  private routeHighlight = inject(RouteHighlightService);
  private router = inject(Router);

  selectedLine = signal<Line | null>(null);
  startStop = signal<Stop | null>(null);
  arrivalStop = signal<Stop | null>(null);

  time = signal<string>('12:00');
  searchByArrival = signal<boolean>(false);

  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  searchResults = signal<RouteLeg[] | null>(null);

  onLineChange(newLine: Line | null): void {
    // unchanged
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    const start = this.startStop();
    const arrival = this.arrivalStop();

    if (!start?.id || !arrival?.id || !this.time()) {
      this.errorMessage.set('Please select a start stop, arrival stop, and time.');
      return;
    }
    if (start.id === arrival.id) {
      this.errorMessage.set('Start stop and arrival stop cannot be the same.');
      return;
    }

    const payload: RideSearchRequest = {
      time: this.time(),
      searchByArrival: this.searchByArrival(),
      startStopId: start.id,
      arrivalStopId: arrival.id,
    };

    this.loading.set(true);

    this.rideService.searchRideByTime(payload).subscribe({
      next: (legs) => {
        console.log('raw legs from backend:', legs);
        this.loading.set(false);
        this.searchResults.set(legs);

        if (legs?.length) {
          this.routeHighlight.setResult(legs);
          this.router.navigate(['/stop-map']);
        } else {
          this.errorMessage.set('No rides found for this route/time.');
        }
      },
      error: (err) => {
        console.error('Ride search failed:', err);
        this.errorMessage.set('Failed to search rides. Please try again.');
        this.loading.set(false);
      }
    });
  }
}