// src/app/component/line-form/line-form.ts
import { Component, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { LineService } from '../../service/line-service';
import { StopPicker } from '../stop-picker/stop-picker';
import Line from '../../model/line';
import Stop from '../../model/stop';

@Component({
  selector: 'app-line-form',
  standalone: true,
  imports: [ReactiveFormsModule, StopPicker],
  templateUrl: './line-form.html',
  styleUrl: './line-form.css',
})
export class LineForm {
  private fb = inject(FormBuilder);
  private lineService = inject(LineService);

  created = output<Line>();
  submitting = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.group({
    name: ['', Validators.required],
    type: ['', Validators.required],
    provider: [''],
    stopEntries: this.fb.array([this.newStopEntry()]),
  });

  private newStopEntry(): FormGroup {
    return this.fb.group({
      stopId: [null as number | null, Validators.required],
      delta: [null as number | null, Validators.required],
    });
  }

  get stopEntries(): FormArray {
    return this.form.get('stopEntries') as FormArray;
  }

  addStopRow() {
    this.stopEntries.push(this.newStopEntry());
  }

  removeStopRow(index: number) {
    if (this.stopEntries.length > 1) {
      this.stopEntries.removeAt(index);
    }
  }

  onStopSelected(stop: Stop | null, index: number): void {
    this.stopEntries.at(index).patchValue({ stopId: stop ? stop.id : null });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const stopIds = this.stopEntries.controls
      .map(ctrl => ({
        id: ctrl.value.stopId,
        delta: ctrl.value.delta
      }))
      .filter(entry => entry.id != null);

    const payload = {
      name: this.form.value.name!,
      type: this.form.value.type!,
      provider: this.form.value.provider ?? '',
      stopIds,
    } as unknown as Line;

    this.lineService.save(payload).subscribe({
      next: line => {
        this.submitting = false;
        this.successMessage = `Linea "${line.name}" creata con successo.`;
        this.created.emit(line);
        this.form.reset();
        while (this.stopEntries.length > 1) {
          this.stopEntries.removeAt(1);
        }
        this.stopEntries.at(0).reset({ stopId: null, delta: null });
      },
      error: err => {
        this.submitting = false;
        this.errorMessage = 'Errore durante la creazione della linea.';
        console.error(err);
      }
    });
  }
}