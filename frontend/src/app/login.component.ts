import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login to Platform</h2>
        <div class="form-group">
          <label>User ID</label>
          <input type="text" [(ngModel)]="userId" placeholder="Enter User ID" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="Enter Password" />
        </div>
        <div class="form-group">
          <label>Role</label>
          <select [(ngModel)]="role">
            <option value="General User">General User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button (click)="login()" [disabled]="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
        <p *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    .login-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    h2 {
      margin-bottom: 2rem;
      color: #333;
      text-align: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }
    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #4a90e2;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s ease;
      margin-top: 1rem;
    }
    button:hover {
      background: #357abd;
    }
    button:disabled {
      background: #a0c4e8;
      cursor: not-allowed;
    }
    .error-msg {
      color: #e74c3c;
      margin-top: 1rem;
      text-align: center;
      font-size: 0.9rem;
    }
  `]
})
export class LoginComponent {
  userId = '';
  password = '';
  role = 'General User';
  delay = 1000;
  isLoading = false;
  errorMessage = '';

  constructor(private userService: UserService, private router: Router) {
    if (this.userService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.login(this.userId, this.password, this.role, this.delay).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message;
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
        this.isLoading = false;
      }
    });
  }
}
