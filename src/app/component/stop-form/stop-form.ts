// src/app/component/stop-form/stop-form.ts

import { Component, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import Stop from '../../model/stop';
import Line from '../../model/line';
import MapIdDelta from '../../model/map-id-delta';
import { StopService } from '../../service/stop-service';
import { GeocodingService } from '../../service/geocoding-service';
import { LinePicker } from '../line-picker/line-picker';

@Component({
  selector: 'app-stop-form',
  standalone: true,
  imports: [ReactiveFormsModule, LinePicker],
  templateUrl: './stop-form.html',
  styleUrl: './stop-form.css',
})
export class StopForm {

  private fb = inject(FormBuilder);
  private stopService = inject(StopService);
  private geocodingService = inject(GeocodingService);
  lines : Line[] = [];
  created = output<Stop>();

  submitting = false;
  successMessage = '';
  errorMessage = '';

  form = this.fb.group({
    name: ['', Validators.required],
    road: [''],
    city: [''],
    lat: [0],
    lon: [0],
    lineEntries: this.fb.array([this.createLineEntry()])
  });

  get lineEntries(): FormArray {
    return this.form.get('lineEntries') as FormArray;
  }

  private createLineEntry(): FormGroup {
    return this.fb.group({
      lineId: [null as number | null],
      delta: [0, Validators.required]
    });
  }

  addLineEntry(): void {
    this.lineEntries.push(this.createLineEntry());
  }

  removeLineEntry(index: number): void {
    if (this.lineEntries.length > 1) {
      this.lineEntries.removeAt(index);
    }
  }

  onLineSelected(line: Line | null, index: number): void {
  this.lineEntries.at(index).patchValue({ lineId: line ? line.id : null });
}

  onSubmit(): void {

    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const address =
      `${this.form.value.road}, ${this.form.value.city} Italia`;

    this.geocodingService.geocode(address).subscribe({

      next: (res: any) => {

        if (res && res.length > 0) {
          this.form.patchValue({
            lat: Number(res[0].lat),
            lon: Number(res[0].lon)
          });
        }

        const lineIds: MapIdDelta[] = this.lineEntries.controls
          .map(ctrl => ({
            id: ctrl.value.lineId,
            delta: ctrl.value.delta
          }))
          .filter((entry): entry is MapIdDelta => entry.id != null);

        const stop: Stop = {
          name: this.form.value.name ?? '',
          road: this.form.value.road ?? '',
          city: this.form.value.city ?? '',
          lat: this.form.value.lat ?? 0,
          lon: this.form.value.lon ?? 0,
          lines: [],
          lineIds
        } as Stop;

        this.stopService.save(stop).subscribe({

          next: savedStop => {

            this.submitting = false;

            this.successMessage =
              `Stazione "${savedStop.name}" creata con successo!`;

            this.errorMessage = '';

            this.created.emit(savedStop);

            this.resetForm();
          },

          error: err => {

            this.submitting = false;

            this.errorMessage =
              'Errore durante la creazione della stazione. Riprova.';

            this.successMessage = '';

            console.error(err);
          }

        });

      },

      error: err => {

        this.submitting = false;

        this.errorMessage =
          'Errore durante la ricerca della posizione della stazione.';

        console.error(err);
      }

    });

  }

  resetForm(): void {

    this.form.reset({
      name: '',
      road: '',
      city: '',
      lat: 0,
      lon: 0
    });

    while (this.lineEntries.length > 1) {
      this.lineEntries.removeAt(1);
    }
    this.lineEntries.at(0).reset({ lineId: null, delta: 0 });
  }

}