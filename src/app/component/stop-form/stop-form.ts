// src/app/component/stop-form/stop-form.ts
import { Component, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StopService } from '../../service/stop-service';
import Stop from '../../model/stop';

@Component({
  selector: 'app-stop-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './stop-form.html',
  styleUrl: './stop-form.css',
})
export class StopForm {
  private fb = inject(FormBuilder);
  private stopService = inject(StopService);

  created = output<Stop>();
  submitting = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.group({
    name: ['', Validators.required],
    road: [''],
    city: [''],
    lat: [null as number | null, [Validators.required, Validators.min(-90), Validators.max(90)]],
    lon: [null as number | null, [Validators.required, Validators.min(-180), Validators.max(180)]],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.stopService.save(this.form.value as Partial<Stop>).subscribe({
      next: stop => {
        this.submitting = false;
        this.successMessage = `Stazione "${stop.name}" creata con successo.`;
        this.created.emit(stop);
        this.form.reset();
      },
      error: err => {
        this.submitting = false;
        this.errorMessage = 'Errore durante la creazione della stazione.';
        console.error(err);
      }
    });
  }
}