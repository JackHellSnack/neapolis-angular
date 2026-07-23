import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LineService } from '../../service/line-service';
import { StopPicker } from '../stop-picker/stop-picker';
import Stop from '../../model/stop';
import MapIdDelta from '../../model/map-id-delta';

@Component({
  selector: 'app-line-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StopPicker],
  templateUrl: './line-form.html',
  styleUrl: './line-form.css'
})
export class LineForm {
  private lineService = inject(LineService);
  private router = inject(Router);

  name     = signal('');
  type     = signal('');
  provider = signal('');
  stopIds  = signal<MapIdDelta[]>([]);
  newStop  = signal<Stop | null>(null);
  newDelta = signal<number>(0);

  loading = signal(false);
  error   = signal<string | null>(null);
  success = signal(false);

  addStop() {
    const s = this.newStop();
    if (!s?.id) return;
    if (this.stopIds().some(x => x.id === s.id)) return;
    this.stopIds.update(ls => [...ls, { id: s.id!, delta: this.newDelta() }]);
    this.newStop.set(null);
    this.newDelta.set(this.newDelta() + 1);
  }

  removeStop(id: number) { this.stopIds.update(ls => ls.filter(x => x.id !== id)); }

  onSubmit() {
    this.error.set(null);
    if (!this.name().trim() || !this.type().trim() || !this.provider().trim()) {
      this.error.set('Nome, tipo e gestore sono obbligatori.'); return;
    }
    this.loading.set(true);
    const payload = { name: this.name(), type: this.type(), provider: this.provider(), stopIds: this.stopIds() };
    this.lineService.save(payload).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); setTimeout(() => this.router.navigate(['/admin']), 1000); },
      error: () => { this.error.set('Errore durante il salvataggio.'); this.loading.set(false); }
    });
  }
}
