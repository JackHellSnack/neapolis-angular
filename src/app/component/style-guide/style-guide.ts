import { Component } from '@angular/core';

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [],
  templateUrl: './style-guide.html',
  styleUrl: './style-guide.css',
})
export class StyleGuide {
  colors = [
    { name: '--blu-golfo', value: '#0B3D5C' },
    { name: '--blu-notte', value: '#082C42' },
    { name: '--azzurro', value: '#2C8FBF' },
    { name: '--maiolica', value: '#E4703A' },
    { name: '--sole', value: '#F2B705' },
    { name: '--crema', value: '#FAF3E8' },
    { name: '--carta', value: '#FFFDF9' },
    { name: '--inchiostro', value: '#12232E' },
  ];
}