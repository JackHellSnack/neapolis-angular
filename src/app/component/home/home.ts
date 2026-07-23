import { Component, signal } from '@angular/core';
import { StopForm } from '../stop-form/stop-form';
import { StopMap } from '../stop-map/stop-map';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [StopForm, StopMap],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  protected readonly title = signal('neapolis-angular');
}