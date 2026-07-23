import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PointOfInterestService } from '../../service/point-of-interest-service';
import { StopPicker } from '../stop-picker/stop-picker';
import Stop from '../../model/stop';
import PointOfInterest from '../../model/point-of-interest';

@Component({
  selector: 'app-poi-form',
  standalone: true,
  imports: [ReactiveFormsModule, StopPicker],
  templateUrl: './poi-form.html',
  styleUrl: './poi-form.css',
})
export class PoiForm {
  private fb = inject(FormBuilder);
  private poiService = inject(PointOfInterestService);

  selectedStop: Stop | null = null;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  form = this.fb.group({
    name: ['', Validators.required],
    category: [''],
    lat: [0, Validators.required],
    lon: [0, Validators.required],
  });

  onStopSelected(stop: Stop | null): void {
    this.selectedStop = stop;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedStop?.id) {
      this.errorMessage = 'Compila il nome e seleziona una fermata.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const poi: PointOfInterest = {
      name: this.form.value.name ?? '',
      category: this.form.value.category ?? '',
      lat: this.form.value.lat ?? 0,
      lon: this.form.value.lon ?? 0,
      stopId: this.selectedStop.id,
    };

    this.poiService.save(poi).subscribe({
      next: saved => {
        this.submitting = false;
        this.successMessage = `Punto di interesse "${saved.name}" creato con successo.`;
        this.form.reset({ name: '', category: '', lat: 0, lon: 0 });
        this.selectedStop = null;
      },
      error: err => {
        this.submitting = false;
        this.errorMessage = 'Errore durante la creazione del punto di interesse.';
        console.error(err);
      }
    });
  }
}