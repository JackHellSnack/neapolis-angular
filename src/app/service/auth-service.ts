import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../model/LoginRequest';
import { LoginResponse } from '../model/login-response';
import { RegisterRequest } from '../model/register-request';
import User from '../model/user';
import { PasswordUpdateRequest } from '../model/password-update-request';

const TOKEN_KEY = 'np_token';
const ROLE_KEY  = 'np_role';
const USER_KEY  = 'np_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/neapolis/api/auth';
  

  isLoggedIn = signal<boolean>(!!localStorage.getItem(TOKEN_KEY));
  userRole   = signal<string | null>(localStorage.getItem(ROLE_KEY));
  username   = signal<string | null>(localStorage.getItem(USER_KEY));

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.applySession(response))
    );
  }

  /** Fetches the currently logged-in user's own profile. */
  whoami(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/whoami`);
  }

  updpwd(passwordUpdateRequest: PasswordUpdateRequest): Observable<void> {
  return this.http.patch<void>(`${this.apiUrl}/updpwd`, passwordUpdateRequest);
}

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    this.isLoggedIn.set(false);
    this.userRole.set(null);
    this.username.set(null);
  }

  isAdmin(): boolean {
    const r = this.userRole();
    return r === 'ADMIN' || r === 'ROLE_ADMIN';
  }

  /**
   * Keeps the locally cached username (shown in the nav bar, etc.) in sync
   * after the user edits their profile. The auth token itself still carries
   * the old username until the next login/refresh — that's fine, we only
   * use the token for auth, not for display.
   */
  setUsername(username: string): void {
    localStorage.setItem(USER_KEY, username);
    this.username.set(username);
  }

  private applySession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    const role = this.getRole(response.token);
    const user = this.getSubject(response.token);
    if (role) localStorage.setItem(ROLE_KEY, role);
    if (user) localStorage.setItem(USER_KEY, user);
    this.isLoggedIn.set(true);
    this.userRole.set(role);
    this.username.set(user);
  }

  private getRole(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.ROLE;
    }
    catch {
      return null;
    }
  }

  private getSubject(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    }
    catch {
      return null;
    }
  }
}
