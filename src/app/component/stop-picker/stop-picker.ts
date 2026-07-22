import { Component, OnInit, inject, signal, computed, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StopService } from '../../service/stop-service';
import Stop from '../../model/stop';


@Component({
  selector: 'app-stop-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stop-picker.html',
  styleUrls: ['./stop-picker.css']
})
export class StopPicker implements OnInit {

  private stopService = inject(StopService);

  // Two-way binding with parent
  stop = model<Stop | null>(null);

  // Complete list of stops
  private allStops = signal<Stop[]>([]);

  // Search text
  searchQuery = signal('');

  // Dropdown visibility
  showDropdown = signal(false);

  // Filtered list
  filteredStops = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return [];
    }

    return this.allStops().filter(stop =>
      stop.name.toLowerCase().includes(query) ||
      stop.road?.toLowerCase().includes(query) ||
      stop.city?.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.stopService.findAll().subscribe({
      next: (data) => {
        this.allStops.set(data ?? []);

        const initialStop = this.stop();
        if (initialStop) {
          this.searchQuery.set(initialStop.name);
        }
      },
      error: err => console.error('Error loading stops:', err)
    });
  }

  onInputChange(value: string): void {
    this.searchQuery.set(value);
    this.showDropdown.set(value.trim().length > 0);

    if (!value.trim() || (this.stop() && this.stop()?.name !== value)) {
      this.stop.set(null);
    }
  }

  selectStop(selected: Stop): void {
    this.searchQuery.set(selected.name);
    this.showDropdown.set(false);
    this.stop.set(selected);
  }

  hideDropdownWithDelay(): void {
    setTimeout(() => this.showDropdown.set(false), 200);
  }
}
