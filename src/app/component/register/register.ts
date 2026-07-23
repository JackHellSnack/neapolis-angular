import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth-service';
import { UserService } from '../../service/user-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  authService = inject(AuthService);
  userService = inject(UserService);
  private router = inject(Router);

  username = signal('');
  email    = signal('');
  password = signal('');
  confirmPassword = signal('');

  // Only meaningful/visible when the person filling this form is already an admin.
  createAsAdmin = signal(false);

  loading = signal(false);
  error   = signal<string | null>(null);
  success = signal(false);
  showPwd = signal(false);

  onSubmit() {
    this.error.set(null);

    const username = this.username().trim();
    const email = this.email().trim();
    const password = this.password();

    if (!username || !email || !password) {
      this.error.set('Compila tutti i campi obbligatori.');
      return;
    }
    if (!this.isValidEmail(email)) {
      this.error.set('Inserisci un indirizzo email valido.');
      return;
    }
    if (password.length < 6) {
      this.error.set('La password deve contenere almeno 6 caratteri.');
      return;
    }
    if (password !== this.confirmPassword()) {
      this.error.set('Le password non coincidono.');
      return;
    }

    const payload = { username, email, password };
    this.loading.set(true);

    if (this.authService.isAdmin() && this.createAsAdmin()) {
      // Admin creating another admin: don't touch the current session.
      this.userService.createAdmin(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
          setTimeout(() => this.router.navigate(['/admin']), 1000);
        },
        error: (err) => {
          this.loading.set(false);
          if (err?.status === 409) {
            this.error.set('Username o email già in uso.');
          } else {
            this.error.set('Creazione amministratore non riuscita. Riprova.');
          }
        }
      });
      return;
    }

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status === 409) {
          this.error.set('Username o email già in uso.');
        } else {
          this.error.set('Registrazione non riuscita. Riprova.');
        }
      }
    });
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
