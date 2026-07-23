import { Component, OnInit, inject, signal, computed, model, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StopService } from '../../service/stop-service';
import Stop from '../../model/stop';
import Line from '../../model/line';

@Component({
  selector: 'app-stop-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stop-picker.html',
  styleUrl: './stop-picker.css'
})
export class StopPicker implements OnInit {
  private stopService = inject(StopService);
  line = input<Line | null>(null);
  stop = model<Stop | null>(null);
  private allStops = signal<Stop[]>([]);
  searchQuery = signal('');
  showDropdown = signal(false);

  private availableStops = computed(() => {
    const stops = this.allStops();
    const sel = this.line();
    if (!sel?.stopIds?.length) return stops;
    const ids = new Set(sel.stopIds.map(s => s.id).filter(id => id != null));
    return stops.filter(s => s.id != null && ids.has(s.id));
  });

  filteredStops = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return this.availableStops().filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.road?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.stopService.findAll().subscribe({
      next: data => {
        this.allStops.set(data ?? []);
        const init = this.stop();
        if (init) this.searchQuery.set(init.name);
      },
      error: err => console.error('Error loading stops:', err)
    });
  }

  onInputChange(value: string) {
    this.searchQuery.set(value);
    this.showDropdown.set(value.trim().length > 0);
    if (!value.trim() || (this.stop() && this.stop()?.name !== value)) this.stop.set(null);
  }

  selectStop(s: Stop) { this.searchQuery.set(s.name); this.showDropdown.set(false); this.stop.set(s); }
  hide() { setTimeout(() => this.showDropdown.set(false), 200); }
}
