import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LinePicker } from '../line-picker/line-picker';
import { StopPicker } from '../stop-picker/stop-picker';

import Line from '../../model/line';
import Stop from '../../model/stop';
import RideSearchRequest from '../../model/ride-search-request';
import RideSearchResponse from '../../model/ride-search-response';
import { RideService } from '../../service/ride-service'; // Adjust import path

@Component({
  selector: 'app-ride-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LinePicker, StopPicker],
  templateUrl: './ride-search-form.html',
  styleUrls: ['./ride-search-form.css']
})
export class RideSearchForm {
  private rideService = inject(RideService);

  // Form selections using signals
  selectedLine = signal<Line | null>(null);
  startStop = signal<Stop | null>(null);
  arrivalStop = signal<Stop | null>(null);

  time = signal<string>('12:00');
  searchByArrival = signal<boolean>(false);

  // API State
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  searchResults = signal<RideSearchResponse[] | null>(null);

  /**
   * Resets selected stops if the selected line changes and the current stops 
   * are no longer valid for the newly selected line.
   */
  onLineChange(newLine: Line | null): void {
    /*
    this.selectedLine.set(newLine);

    if (newLine?.stopIds?.length) {
      const allowedIds = new Set(newLine.stopIds.map(s => s.id));

      if (this.startStop() && !allowedIds.has(this.startStop()!.id!)) {
        this.startStop.set(null);
      }
      if (this.arrivalStop() && !allowedIds.has(this.arrivalStop()!.id!)) {
        this.arrivalStop.set(null);
      }
    }*/
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    const start = this.startStop();
    const arrival = this.arrivalStop();


    // Validation
    if (!start?.id || !arrival?.id || !this.time()) {
      this.errorMessage.set('Please select a line, start stop, arrival stop, and time.');
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
      next: (response) => {
        // Normalizes single object vs array responses
        this.searchResults.set(Array.isArray(response) ? response : [response]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Ride search failed:', err);
        this.errorMessage.set('Failed to search rides. Please try again.');
        this.loading.set(false);
      }
    });
  }
}