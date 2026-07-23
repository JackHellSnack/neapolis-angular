import { Component, OnInit, inject, signal, computed, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LineService } from '../../service/line-service';
import Line from '../../model/line';

@Component({
  selector: 'app-line-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './line-picker.html',
  styleUrl: './line-picker.css'
})
export class LinePicker implements OnInit {
  private lineService = inject(LineService);
  line = model<Line | null>(null);
  lineChange = model<Line | null>();
  private allLines = signal<Line[]>([]);
  searchQuery = signal('');
  showDropdown = signal(false);

  filteredLines = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return this.allLines().filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.provider.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.lineService.findAll().subscribe({
      next: data => {
        this.allLines.set(data ?? []);
        const init = this.line();
        if (init) this.searchQuery.set(init.name);
      },
      error: err => console.error('Error loading lines:', err)
    });
  }

  onInputChange(value: string) {
  this.searchQuery.set(value);
  this.showDropdown.set(value.trim().length > 0);

  if (!value.trim() || (this.line() && this.line()?.name !== value)) {
    this.line.set(null);   // automatically emits lineChange
  }
}

selectLine(l: Line) {
  this.searchQuery.set(l.name);
  this.showDropdown.set(false);
  this.line.set(l);        // automatically emits lineChange
}

  hide() { setTimeout(() => this.showDropdown.set(false), 200); }
}
