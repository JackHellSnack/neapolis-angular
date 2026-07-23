import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StopService } from '../../service/stop-service';
import { LinePicker } from '../line-picker/line-picker';
import Line from '../../model/line';
import MapIdDelta from '../../model/map-id-delta';

@Component({
  selector: 'app-stop-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LinePicker],
  templateUrl: './stop-form.html',
  styleUrl: './stop-form.css'
})
export class StopForm {
  private stopService = inject(StopService);
  private router = inject(Router);

  name   = signal('');
  road   = signal('');
  city   = signal('');
  lat    = signal<number | null>(null);
  lon    = signal<number | null>(null);
  lines  = signal<MapIdDelta[]>([]);
  newLine = signal<Line | null>(null);
  newDelta = signal<number>(0);

  loading = signal(false);
  error   = signal<string | null>(null);
  success = signal(false);

  addLine() {
    const l = this.newLine();
    if (!l?.id) return;
    if (this.lines().some(x => x.id === l.id)) return;
    this.lines.update(ls => [...ls, { id: l.id!, delta: this.newDelta() }]);
    this.newLine.set(null);
    this.newDelta.set(0);
  }

  removeLine(id: number) { this.lines.update(ls => ls.filter(x => x.id !== id)); }

  onSubmit() {
    this.error.set(null);
    if (!this.name().trim() || this.lat() == null || this.lon() == null) {
      this.error.set('Nome, latitudine e longitudine sono obbligatori.'); return;
    }
    this.loading.set(true);
    const payload = { name: this.name(), road: this.road(), city: this.city(), lat: this.lat()!, lon: this.lon()!, lineIds: this.lines() };
    this.stopService.save(payload).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); setTimeout(() => this.router.navigate(['/admin']), 1000); },
      error: () => { this.error.set('Errore durante il salvataggio.'); this.loading.set(false); }
    });
  }
}
