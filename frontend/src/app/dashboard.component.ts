import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-layout">
      <nav class="navbar">
        <div class="logo">App Portal</div>
        <div class="nav-right" *ngIf="user">
          <span class="user-badge">{{ user.role }}</span>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </nav>

      <div class="container" *ngIf="user">
        <div class="header-section">
          <h1>Welcome, {{ user.name || user.userId }}!</h1>
          <p>You are logged in as an <strong>{{ user.role }}</strong>.</p>
          <button (click)="loadData()" class="btn-primary reload-btn">Reload Data</button>
        </div>

        <!-- General Records Section -->
        <div class="card">
          <h2>Your Records</h2>
          <div *ngIf="isLoadingRecords" class="loader-container">
            <div class="spinner"></div>
            <p>Loading your records... ({{ apiDelay }}ms delay)</p>
          </div>
          <div *ngIf="recordsError" class="error-msg" style="color: red; margin-bottom: 1rem;">
            Error: {{ recordsError }}
          </div>
          
          <table *ngIf="!isLoadingRecords" class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Access Level</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let record of records">
                <td>{{ record.id }}</td>
                <td>{{ record.data }}</td>
                <td>
                  <span class="status-badge" [ngClass]="record.access.toLowerCase()">
                    {{ record.access }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="records.length === 0">
                <td colspan="3" class="text-center">No records found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Admin Only Section -->
        <div class="card admin-section" *ngIf="user.role === 'Admin'">
          <h2>System Users (Admin View)</h2>
          <div *ngIf="isLoadingUsers" class="loader-container">
            <div class="spinner"></div>
            <p>Loading user list... ({{ apiDelay }}ms delay)</p>
          </div>
          <div *ngIf="usersError" class="error-msg" style="color: red; margin-bottom: 1rem;">
            Error: {{ usersError }}
          </div>
          
          <table *ngIf="!isLoadingUsers" class="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of systemUsers">
                <td>{{ u.userId }}</td>
                <td>{{ u.name }}</td>
                <td>{{ u.role }}</td>
                <td>
                  <button class="btn-secondary btn-sm">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      background: #f4f7f6;
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .navbar {
      background: #fff;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-badge {
      background: #e3f2fd;
      color: #1565c0;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: bold;
    }
    .logout-btn {
      background: transparent;
      border: 1px solid #e74c3c;
      color: #e74c3c;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .logout-btn:hover {
      background: #e74c3c;
      color: white;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }
    .header-section {
      margin-bottom: 2rem;
    }
    .header-section h1 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }
    .reload-btn {
      margin-top: 1rem;
    }
    .btn-primary {
      background: #4a90e2;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary:hover {
      background: #357abd;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 5px 20px rgba(0,0,0,0.05);
      margin-bottom: 2rem;
    }
    .card h2 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #eee;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }
    .admin-section {
      border-top: 4px solid #e67e22;
    }
    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 0;
      color: #666;
    }
    .spinner {
      border: 4px solid rgba(0,0,0,0.1);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border-left-color: #4a90e2;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th, .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .data-table th {
      background: #f8fafc;
      color: #64748b;
      font-weight: 600;
    }
    .data-table tbody tr:hover {
      background: #f8fafc;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: bold;
    }
    .status-badge.all {
      background: #d4edda;
      color: #155724;
    }
    .status-badge.restricted {
      background: #fff3cd;
      color: #856404;
    }
    .text-center {
      text-align: center !important;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.85rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  records: any[] = [];
  systemUsers: User[] = [];
  
  isLoadingRecords = false;
  isLoadingUsers = false;
  apiDelay = 1500;
  recordsError = '';
  usersError = '';

  constructor(private userService: UserService, private router: Router, private cdr: ChangeDetectorRef) {
    this.user = this.userService.currentUserValue;
    if (!this.user) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    if (this.user) {
      this.loadData();
    }
  }

  loadData() {
    if (!this.user) return;
    
    this.recordsError = '';
    this.usersError = '';

    // Load Records
    this.isLoadingRecords = true;
    this.userService.getRecords(this.user.role, this.apiDelay).subscribe({
      next: (res) => {
        if (res.success) {
          this.records = res.records;
        }
        this.isLoadingRecords = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.recordsError = err.message || 'Unknown error occurred';
        this.isLoadingRecords = false;
        this.cdr.detectChanges();
      }
    });

    // If Admin, load system users
    if (this.user.role === 'Admin') {
      this.isLoadingUsers = true;
      this.userService.getAllUsers(this.apiDelay).subscribe({
        next: (res) => {
          if (res.success) {
            this.systemUsers = res.users;
          }
          this.isLoadingUsers = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.usersError = err.message || 'Unknown error occurred';
          this.isLoadingUsers = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
