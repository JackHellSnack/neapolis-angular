// src/app/component/line-form/line-form.ts
import { Component, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LineService } from '../../service/line-service';
import Line from '../../model/line';

@Component({
  selector: 'app-line-form',
  standalone: true,
  imports: [ReactiveFormsModule],
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
    stopIds: this.fb.array([this.newStopIdRow()]),
  });

  private newStopIdRow() {
    return this.fb.group({
      id: [null as number | null, Validators.required],
      delta: [null as number | null, Validators.required],
    });
  }

  get stopIds() {
    return this.form.get('stopIds') as import('@angular/forms').FormArray;
  }

  addStopRow() {
    this.stopIds.push(this.newStopIdRow());
  }

  removeStopRow(index: number) {
    if (this.stopIds.length > 1) {
      this.stopIds.removeAt(index);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      name: this.form.value.name!,
      type: this.form.value.type!,
      provider: this.form.value.provider ?? '',
      stopIds: this.form.value.stopIds as { id: number; delta: number }[],
    } as unknown as Line;

    this.lineService.save(payload).subscribe({
      next: line => {
        this.submitting = false;
        this.successMessage = `Linea "${line.name}" creata con successo.`;
        this.created.emit(line);
        this.form.reset();
        while (this.stopIds.length > 1) {
          this.stopIds.removeAt(1);
        }
      },
      error: err => {
        this.submitting = false;
        this.errorMessage = 'Errore durante la creazione della linea.';
        console.error(err);
      }
    });
  }
}