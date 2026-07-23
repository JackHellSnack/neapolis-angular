import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import User from '../model/user';
import { UpdateUserRequest } from '../model/update-user-request';
import { RegisterRequest } from '../model/register-request';


@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/neapolis/api/users';
  

  

  /** Updates username / email / (optionally) password for the logged-in user. */
  updateMe(data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}`, data);
  }

  /**
   * Admin-only: creates another admin account.
   * Does NOT touch the current session — the admin performing the action
   * stays logged in as themselves, the new account is just created server-side.
   */
  createAdmin(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/createAdmin`, data);
  }

  /**
   * Registers a new traveler account.
   * The backend is expected to return a token just like /login, so the user
   * is signed in immediately after registering.
   */
  createUser(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/createUser`, data);
  }

  update(data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}`, data);
  }
}
