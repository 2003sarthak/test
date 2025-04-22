<div class="notification-panel-wrapper">
        <div class="notification-icon-wrapper">
          <i class="fas fa-bell notification-icon" (click)="toggleNotifications()"></i>
          <span class="notification-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
        </div>
        <div *ngIf="showNotifications" class="notification-panel">
          <div *ngIf="alerts.length === 0" class="no-alerts">No notifications</div>
          <div *ngFor="let alert of topFiveAlerts; let i = index" class="alert" [ngClass]="alert.type">
            <div class="alert-content">
              {{ alert.message }}
              <i 
                class="fas fa-check-circle mark-read-icon" 
                [class.read]="alert.seen"
                (click)="markAsRead(i)">
              </i>
            </div>
          </div>
          <div class="more-alerts" *ngIf="remainingAlerts.length > 0">
            <div class="scrollable-alerts">
              <div *ngFor="let alert of remainingAlerts; let j = index" class="alert" [ngClass]="alert.type">
                <div class="alert-content">
                  {{ alert.message }}
                  <i 
                    class="fas fa-check-circle mark-read-icon" 
                    [class.read]="alert.seen"
                    (click)="markAsRead(j + 5)">
                  </i>
                </div>
              </div>
            </div>
          </div>
        </div>



/*notification pannel*/
.notification-panel-wrapper {
    position: relative;
  }
  
  .notification-panel {
    position: absolute;
    top: 35px;
    right: 0;
    width: 300px;
    background-color: #0A0A0A;
    border: 1px solid #333333;
    border-radius: 10px;
    padding: 10px;
    z-index: 1001;
    color: white;
    max-height: 400px;
    overflow-y: auto;
    box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  }
  
  .no-alerts {
    text-align: center;
    color: #9ca3af;
  }
  
  .alert {
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
    position: relative;
    text-align: left;
  }
  
  .alert-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .success {
    background-color: #d4edda;
    color: #155724;
  }
  
  .error {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .scrollable-alerts {
    max-height: 200px;
    overflow-y: auto;
    overflow-x: hidden; 
    scrollbar-width: thin;
  }
  
  .mark-read-icon {
    cursor: pointer;
    color: #f87171;
    margin-left: 10px;
  }
  
  .mark-read-icon.read {
    color: #9ca3af;
  }


  .notification-icon-wrapper {
    position: relative;
  }
  
  .notification-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background-color: #ef4444; /* Tailwind red-500 */
    color: white;
    border-radius: 50%;
    font-size: 12px;
    padding: 2px 6px;
    min-width: 18px;
    text-align: center;
    font-weight: bold;
  }




import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserServiceService } from '../../../Services/User.Service/user-service.service';
import { User } from '../../Models/User.Model';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgIf,NgFor,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  showDropdown = false;
  loggedInUser: User | null = null;
  alerts: any[] = [];
  showNotifications: boolean = false;


  constructor(private userService: UserServiceService, private router: Router) {}

  ngOnInit(): void {
    this.loggedInUser = this.userService.getLoggedInUser();
    this.userService.userLoggedIn$.subscribe(user => {
      this.loggedInUser = user;
    });
    const storedAlerts = localStorage.getItem('alerts');
    this.alerts = storedAlerts ? JSON.parse(storedAlerts) : [];
  }

  get topFiveAlerts() {
    return this.alerts.slice(0, 5);
  }
  
  get remainingAlerts() {
    return this.alerts.slice(5);
  }
  
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }
  
  markAsRead(index: number): void {
    this.alerts[index].seen = true;
    localStorage.setItem('alerts', JSON.stringify(this.alerts));
  }

  get unreadCount(): number {
    return this.alerts.filter(alert => !alert.seen).length;
  }

  logout(): void {
    this.userService.logout();
    this.loggedInUser = null;
    this.router.navigate(['/home']).then(() => {
      window.scrollTo(0, 0);
    });
  }
}




/* Read alert styling */
.read-alert {
  background-color: #1f2937 !important;
  color: #9ca3af !important;
}

/* Alert content and icon */
.alert-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mark-read-icon {
  cursor: pointer;
  color: #f87171;
  margin-left: 10px;
  transition: color 0.3s;
}

.mark-read-icon.read {
  color: #9ca3af;
}


<div class="notification-scroll-container">
          <div *ngFor="let alert of alerts; let i = index" class="alert" 
               [ngClass]="[alert.type, alert.seen ? 'read-alert' : '']">
            <div class="alert-content">
              {{ alert.message }}
              <i class="fas fa-check-circle mark-read-icon" 
                 [class.read]="alert.seen" 
                 (click)="markAsRead(i)">
              </i>
            </div>
          </div>
        </div>
