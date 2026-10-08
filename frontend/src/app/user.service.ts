import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  userId: string;
  role: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(userId: string, password: string, role: string, delay: number = 0): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login?delay=${delay}`, { userId, password, role })
      .pipe(
        tap(response => {
          if (response && response.success) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getRecords(role: string, delay: number = 0): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/records?role=${role}&delay=${delay}`);
  }

  getAllUsers(delay: number = 0): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users?delay=${delay}`);
  }
}
