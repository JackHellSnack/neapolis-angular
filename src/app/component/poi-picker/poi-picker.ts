import { Component, OnInit, inject, signal, computed, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PointOfInterestService } from '../../service/point-of-interest-service';
import PointOfInterest from '../../model/point-of-interest';

@Component({
  selector: 'app-poi-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poi-picker.html',
  styleUrl: './poi-picker.css'
})
export class PoiPicker implements OnInit {
  private poiService = inject(PointOfInterestService);
  poi = model<PointOfInterest | null>(null);
  private allPois = signal<PointOfInterest[]>([]);
  searchQuery = signal('');
  showDropdown = signal(false);

  filteredPois = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return this.allPois().filter(p =>
      p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.poiService.findAll().subscribe({
      next: data => {
        this.allPois.set(data ?? []);
        const init = this.poi();
        if (init) this.searchQuery.set(init.name);
      },
      error: err => console.error('Error loading POIs:', err)
    });
  }

  onInputChange(value: string) {
    this.searchQuery.set(value);
    this.showDropdown.set(value.trim().length > 0);
    if (!value.trim() || (this.poi() && this.poi()?.name !== value)) this.poi.set(null);
  }

  selectPoi(p: PointOfInterest) { this.searchQuery.set(p.name); this.showDropdown.set(false); this.poi.set(p); }
  hide() { setTimeout(() => this.showDropdown.set(false), 200); }
}
