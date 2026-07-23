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
  styleUrls: ['./poi-picker.css']
})
export class PoiPicker implements OnInit {

  private poiService = inject(PointOfInterestService);

  // Two-way binding con il parent.
  // model() genera automaticamente anche l'output "poiChange",
  // quindi nel template del parent si può usare sia [(poi)] che (poiChange).
  poi = model<PointOfInterest | null>(null);

  // Lista completa dei poi
  private allPois = signal<PointOfInterest[]>([]);

  // Testo di ricerca
  searchQuery = signal('');

  // Visibilità dropdown
  showDropdown = signal(false);

  // Poi filtrati in base alla query
  filteredPois = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return [];
    }

    return this.allPois().filter(poi =>
      poi.name.toLowerCase().includes(query) ||
      poi.category?.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.poiService.findAll().subscribe({
      next: (data) => {
        this.allPois.set(data ?? []);

        const initialPoi = this.poi();
        if (initialPoi) {
          this.searchQuery.set(initialPoi.name);
        }
      },
      error: err => console.error('Error loading points of interest:', err)
    });
  }

  onInputChange(value: string): void {
    this.searchQuery.set(value);
    this.showDropdown.set(value.trim().length > 0);

    if (!value.trim() || (this.poi() && this.poi()?.name !== value)) {
      this.poi.set(null);
    }
  }

  selectPoi(selected: PointOfInterest): void {
    this.searchQuery.set(selected.name);
    this.showDropdown.set(false);
    this.poi.set(selected);
  }

  hideDropdownWithDelay(): void {
    setTimeout(() => this.showDropdown.set(false), 200);
  }
}