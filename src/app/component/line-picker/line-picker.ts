import { Component, OnInit, inject, signal, computed, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LineService } from '../../service/line-service';
import Line from '../../model/line';


@Component({
  selector: 'app-line-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './line-picker.html',
  styleUrls: ['./line-picker.css']
})
export class LinePicker implements OnInit {

  private lineService = inject(LineService);

  // Two-way binding with parent
  line = model<Line | null>(null);

  // Complete list of lines
  private allLines = signal<Line[]>([]);

  // Search text
  searchQuery = signal('');

  // Dropdown visibility
  showDropdown = signal(false);

  // Filtered list
  filteredLines = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return [];
    }

    return this.allLines().filter(line =>
      line.name.toLowerCase().includes(query) ||
      line.provider.toLowerCase().includes(query) ||
      line.type.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.lineService.findAll().subscribe({
      next: (data) => {
        this.allLines.set(data ?? []);

        const initialLine = this.line();
        if (initialLine) {
          this.searchQuery.set(initialLine.name);
        }
      },
      error: err => console.error('Error loading lines:', err)
    });
  }

  onInputChange(value: string): void {
    this.searchQuery.set(value);
    this.showDropdown.set(value.trim().length > 0);

    if (!value.trim() || (this.line() && this.line()?.name !== value)) {
      this.line.set(null);
    }
  }

  selectLine(selected: Line): void {
    this.searchQuery.set(selected.name);
    this.showDropdown.set(false);
    this.line.set(selected);
  }

  hideDropdownWithDelay(): void {
    setTimeout(() => this.showDropdown.set(false), 200);
  }
}