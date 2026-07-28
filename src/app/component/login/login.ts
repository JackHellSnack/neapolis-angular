import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth-service';
import { SquircleDirective } from '../../directive/squircle';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,SquircleDirective],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal('');
  password = signal('');
  loading  = signal(false);
  error    = signal<string | null>(null);
  showPwd  = signal(false);

  onSubmit() {
    this.error.set(null);
    if (!this.username().trim() || !this.password().trim()) {
      this.error.set('Inserisci username e password.');
      return;
    }

    this.loading.set(true);
    this.authService.login({ username: this.username().trim(), password: this.password() }).subscribe({
      next: () => {
        this.loading.set(false);
        
        this.router.navigate(['/home-map']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Credenziali non valide. Riprova.');
      }
    });
  }
}
