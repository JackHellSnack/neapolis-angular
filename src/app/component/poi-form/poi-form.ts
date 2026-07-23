import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PointOfInterestService } from '../../service/point-of-interest-service';
import { StopPicker } from '../stop-picker/stop-picker';
import Stop from '../../model/stop';

@Component({
  selector: 'app-poi-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StopPicker],
  templateUrl: './poi-form.html',
  styleUrl: './poi-form.css'
})
export class PoiForm {
  private poiService = inject(PointOfInterestService);
  private router = inject(Router);

  name     = signal('');
  category = signal('');
  lat      = signal<number | null>(null);
  lon      = signal<number | null>(null);
  stop     = signal<Stop | null>(null);

  loading = signal(false);
  error   = signal<string | null>(null);
  success = signal(false);

  onSubmit() {
    this.error.set(null);
    const stop = this.stop();
    if (!this.name().trim() || !stop?.id) {
      this.error.set('Nome, coordinate e fermata collegata sono obbligatori.'); return;
    }
    this.loading.set(true);
    const payload = { name: this.name(), category: this.category(), lat: this.lat()!, lon: this.lon()!, stopId: stop.id };
    this.poiService.save(payload).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); setTimeout(() => this.router.navigate(['/admin']), 1000); },
      error: () => { this.error.set('Errore durante il salvataggio.'); this.loading.set(false); }
    });
  }
}
