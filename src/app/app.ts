import { Component, signal } from '@angular/core';
import { StopForm } from './component/stop-form/stop-form';
import { StopMap } from './component/stop-map/stop-map';

@Component({
  selector: 'app-root',
  imports: [StopForm, StopMap],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('neapolis-angular');
}