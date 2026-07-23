import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StopService } from '../../service/stop-service';
import { LineService } from '../../service/line-service';
import { PointOfInterestService } from '../../service/point-of-interest-service';
import Stop from '../../model/stop';
import Line from '../../model/line';
import PointOfInterest from '../../model/point-of-interest';

type Tab = 'stops' | 'lines' | 'pois';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  private stopService = inject(StopService);
  private lineService = inject(LineService);
  private poiService  = inject(PointOfInterestService);

  activeTab = signal<Tab>('stops');
  stops     = signal<Stop[]>([]);
  lines     = signal<Line[]>([]);
  pois      = signal<PointOfInterest[]>([]);
  loading   = signal(true);

  ngOnInit() {
    this.stopService.findAll().subscribe({ next: d => this.stops.set(d), error: () => {} });
    this.lineService.findAll().subscribe({ next: d => this.lines.set(d), error: () => {} });
    this.poiService.findAll().subscribe({
      next: d => { this.pois.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setTab(tab: Tab) { this.activeTab.set(tab); }

  deleteStop(id: number) {
    if (!confirm('Eliminare questa fermata?')) return;
    this.stopService.delete(id).subscribe({
      next: () => this.stops.update(s => s.filter(x => x.id !== id)),
      error: () => alert('Errore nella cancellazione.')
    });
  }

  deleteLine(id: number) {
    if (!confirm('Eliminare questa linea?')) return;
    this.lineService.delete(id).subscribe({
      next: () => this.lines.update(l => l.filter(x => x.id !== id)),
      error: () => alert('Errore nella cancellazione.')
    });
  }

  deletePoi(id: number) {
    if (!confirm('Eliminare questo POI?')) return;
    this.poiService.delete(id).subscribe({
      next: () => this.pois.update(p => p.filter(x => x.id !== id)),
      error: () => alert('Errore nella cancellazione.')
    });
  }
}
