import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth-service';
import { JourneyService } from '../../service/journey-service';
import { GeolocationService } from '../../service/geolocation-service';
import { RouteHighlightService } from '../../service/route-highlight-service';

import RouteLeg from '../../model/route-leg';
import { UserService } from '../../service/user-service';
import { PasswordUpdateRequest } from '../../model/password-update-request';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard implements OnInit, OnDestroy {
  authService      = inject(AuthService);
  journeyService   = inject(JourneyService);
  geolocationService = inject(GeolocationService);
  routeHighlight   = inject(RouteHighlightService);
  private userService = inject(UserService);

  journeyStatus    = signal<any | null>(null);
  journeyLegs      = signal<RouteLeg[] | null>(null);
  loading          = signal(true);
  pinging          = signal(false);
  ending           = signal(false);
  statusError      = signal<string | null>(null);
  pingSuccess      = signal<string | null>(null);

  // --- Profile / account settings ---
  editingProfile   = signal(false);
  profileUsername  = signal('');
  profileEmail     = signal('');
  oldPassword      = signal('');
  newPassword      = signal('');
  confirmPassword  = signal('');
  profileLoading   = signal(false);
  profileError     = signal<string | null>(null);
  profileSuccess   = signal<string | null>(null);

  private pingInterval: any;

  ngOnInit() {
    this.loadStatus();
    this.loadProfile();
    const cached = this.routeHighlight.legs();
    if (cached) this.journeyLegs.set(cached);
  }

  ngOnDestroy() {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }

  loadStatus() {
    this.loading.set(true);
    this.statusError.set(null);
    this.journeyService.getStatus().subscribe({
      next: status => { this.journeyStatus.set(status); this.loading.set(false); },
      error: () => { this.journeyStatus.set(null); this.loading.set(false); }
    });
  }

  loadProfile() {
    this.authService.whoami().subscribe({
      next: user => {
        this.profileUsername.set(user.username);
        this.profileEmail.set(user.email);
      },
      error: () => {
        // fall back to what we already know from the token if /me isn't reachable
        this.profileUsername.set(this.authService.username() ?? '');
      }
    });
  }

  startEditingProfile() {
    this.profileError.set(null);
    this.profileSuccess.set(null);
    this.oldPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.editingProfile.set(true);
  }

  cancelEditingProfile() {
    this.editingProfile.set(false);
    this.profileError.set(null);
    this.loadProfile(); // discard any unsaved edits
  }

  saveProfile() {
    this.profileError.set(null);
    this.profileSuccess.set(null);

    const username = this.profileUsername().trim();
    const email = this.profileEmail().trim();
    const oldPassword = this.oldPassword();
    const newPassword = this.newPassword();

    if (!username || !email) {
      this.profileError.set('Username ed email sono obbligatori.');
      return;
    }
    if (!this.isValidEmail(email)) {
      this.profileError.set('Inserisci un indirizzo email valido.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      this.profileError.set('La nuova password deve contenere almeno 6 caratteri.');
      return;
    }
    if (newPassword && newPassword !== this.confirmPassword()) {
      this.profileError.set('Le password non coincidono.');
      return;
    }
    if (newPassword && !oldPassword) {
      this.profileError.set('Inserisci la password attuale per impostarne una nuova.');
      return;
    }

    this.profileLoading.set(true);
    this.userService.updateMe({ username, email }).subscribe({
      next: () => {
        this.authService.setUsername(username);

        if (!newPassword) {
          this.finishProfileSave();
          return;
        }

        const passwordUpdateRequest: PasswordUpdateRequest = { oldPassword, newPassword };
        this.authService.updpwd(passwordUpdateRequest).subscribe({
          next: () => this.finishProfileSave(),
          error: (err) => {
            // Username/email are already saved at this point; only the password change failed.
            this.profileLoading.set(false);
            this.editingProfile.set(false);
            if (err?.status === 401 || err?.status === 403) {
              this.profileError.set('Password attuale non corretta.');
            } else {
              this.profileError.set('Dati aggiornati, ma la modifica password non è riuscita.');
            }
          }
        });
      },
      error: (err) => {
        this.profileLoading.set(false);
        if (err?.status === 409) {
          this.profileError.set('Username o email già in uso.');
        } else {
          this.profileError.set('Aggiornamento non riuscito. Riprova.');
        }
      }
    });
  }

  private finishProfileSave() {
    this.profileLoading.set(false);
    this.oldPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.editingProfile.set(false);
    this.profileSuccess.set('Dati aggiornati con successo!');
    setTimeout(() => this.profileSuccess.set(null), 3000);
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  startJourney() {
    const legs = this.journeyLegs();
    if (!legs?.length) { this.statusError.set('Cerca prima un percorso dalla home.'); return; }
    this.journeyService.start(legs).subscribe({
      next: status => {
        this.journeyStatus.set(status);
        this.startPingLoop();
      },
      error: () => this.statusError.set('Errore nell\'avvio del viaggio.')
    });
  }

  endJourney() {
    this.ending.set(true);
    this.journeyService.end().subscribe({
      next: () => {
        this.ending.set(false);
        this.journeyStatus.set(null);
        this.routeHighlight.clear();
        this.journeyLegs.set(null);
        if (this.pingInterval) { clearInterval(this.pingInterval); this.pingInterval = null; }
      },
      error: () => this.ending.set(false)
    });
  }

  pingNow() {
    this.pinging.set(true);
    this.pingSuccess.set(null);
    this.geolocationService.getCurrentPosition().subscribe({
      next: pos => {
        this.journeyService.ping(pos.coords.latitude, pos.coords.longitude).subscribe({
          next: status => {
            this.pinging.set(false);
            this.journeyStatus.set(status);
            this.pingSuccess.set('Posizione aggiornata!');
            setTimeout(() => this.pingSuccess.set(null), 2500);
          },
          error: () => this.pinging.set(false)
        });
      },
      error: () => { this.pinging.set(false); this.statusError.set('Geolocalizzazione non disponibile.'); }
    });
  }

  private startPingLoop() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => this.pingNow(), 30000);
  }

  isJourneyActive(): boolean {
    return !!this.journeyStatus() && this.journeyStatus().active !== false;
  }
}