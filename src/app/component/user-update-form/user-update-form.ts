import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../service/user-service';
import { AuthService } from '../../service/auth-service';
import { FormsModule } from '@angular/forms';
import { PasswordUpdateRequest } from '../../model/password-update-request';

@Component({
  selector: 'app-user-update-form',
  imports: [FormsModule],
  templateUrl: './user-update-form.html',
  styleUrl: './user-update-form.css',
})
export class UserUpdateForm {
  authService      = inject(AuthService);
  private userService = inject(UserService);

  loading          = signal(true);
  statusError      = signal<string | null>(null);
  editingProfile   = signal(false);
  profileUsername  = signal('');
  profileEmail     = signal('');
  oldPassword      = signal('');
  newPassword      = signal('');
  confirmPassword  = signal('');
  profileLoading   = signal(false);
  profileError     = signal<string | null>(null);
  profileSuccess   = signal<string | null>(null);
  interestedCategories = signal<string[]>([]);
  newCategory = signal('');

  ngOnInit() {
    this.loadStatus();
    this.loadProfile();
  }

  addInterest() {
    const category = this.newCategory();
    if (!category) return;
    if (this.interestedCategories().includes(category)) return;
    this.interestedCategories.update(categories => [...categories, category]);
    this.newCategory.set('');
  }

  removeInterest(interest:string){
     this.interestedCategories.update(x => x.filter(category => category !== interest)); 
  }

  loadStatus() {
    this.loading.set(true);
    this.statusError.set(null);
  }

  loadProfile() {
    this.authService.whoami().subscribe({
      next: user => {
        this.profileUsername.set(user.username);
        this.profileEmail.set(user.email);
        this.interestedCategories.set(user.interestedCategories);
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
    const interestedCategories = this.interestedCategories();

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
    this.userService.updateMe({ username, email , interestedCategories}).subscribe({
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

}
