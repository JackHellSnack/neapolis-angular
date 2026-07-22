import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StopMap } from './component/stop-map/stop-map';
import { StopForm } from './component/stop-form/stop-form';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StopForm, StopMap],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('neapolis-angular');
}
