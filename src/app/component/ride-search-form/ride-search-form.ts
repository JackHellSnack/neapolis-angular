// src/app/component/ride-search-form/ride-search-form.ts

import { Component, inject, output } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RideService } from '../../service/ride-service';
import { StopPicker } from '../stop-picker/stop-picker';
import RideSearch from '../../model/ride-search';
import RideData from '../../model/ride-data';
import Stop from '../../model/stop';
import Line from '../../model/line';
import { LinePicker } from '../line-picker/line-picker';

function exactlyOneTimeValidator(group: AbstractControl): ValidationErrors | null {
  const startFilled = !!group.get('startTime')?.value;
  const arrivalFilled = !!group.get('arrivalTime')?.value;

  return startFilled !== arrivalFilled ? null : { exactlyOneTime: true };
}

@Component({
  selector: 'app-ride-search-form',
  standalone: true,
  imports: [ReactiveFormsModule, StopPicker, LinePicker],
  templateUrl: './ride-search-form.html',
  styleUrl: './ride-search-form.css',
})
export class RideSearchForm {

  private fb = inject(FormBuilder);
  private rideService = inject(RideService);

  // Emits the results of a successful search to the parent component
  results = output<RideData[]>();

  searching = false;
  errorMessage = '';
  noResultsMessage = '';

  startStop: Stop | null = null;
  arrivalStop: Stop | null = null;
  line: Line | null = null;

  form = this.fb.group(
    {
      startTime: [''],
      arrivalTime: [''],
    },
    { validators: exactlyOneTimeValidator }
  );

  onStartStopSelected(stop: Stop | null): void {
    this.startStop = stop;
  }

  onArrivalStopSelected(stop: Stop | null): void {
    this.arrivalStop = stop;
  }

  onLineSelected(line:Line | null): void {
    this.line = line;
  }

  // Filling one time field clears the other, so it's obvious only one applies
  onStartTimeInput(): void {
    if (this.form.value.startTime) {
      this.form.patchValue({ arrivalTime: '' }, { emitEvent: false });
    }
  }

  onArrivalTimeInput(): void {
    if (this.form.value.arrivalTime) {
      this.form.patchValue({ startTime: '' }, { emitEvent: false });
    }
  }

  get bothStopsSelected(): boolean {
    return !!this.startStop && !!this.arrivalStop;
  }

  get exactlyOneTimeError(): boolean {
    return (
      this.form.hasError('exactlyOneTime') &&
      (this.form.get('startTime')?.touched || this.form.get('arrivalTime')?.touched || false)
    );
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || !this.bothStopsSelected) {
      return;
    }

    this.searching = true;
    this.errorMessage = '';
    this.noResultsMessage = '';

    const rideSearch: RideSearch = {
      startTime: this.form.value.startTime || '',
      arrivalTime: this.form.value.arrivalTime || '',
      lineId: this.line!.id,
      startStopId: this.startStop!.id,
      arrivalStopId: this.arrivalStop!.id,

    };

    this.rideService.searchRideByTime(rideSearch).subscribe({
      next: rides => {
        this.searching = false;

        this.noResultsMessage =
          !rides || rides.length === 0
            ? 'Nessuna corsa trovata per i criteri inseriti.'
            : '';

        this.results.emit(rides ?? []);
      },
      error: err => {
        this.searching = false;
        this.errorMessage = 'Errore durante la ricerca della corsa. Riprova.';
        console.error(err);
      },
    });
  }

  resetForm(): void {
    this.form.reset({ startTime: '', arrivalTime: '' });
    this.startStop = null;
    this.arrivalStop = null;
    this.errorMessage = '';
    this.noResultsMessage = '';
  }
}