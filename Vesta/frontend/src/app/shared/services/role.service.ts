import { Injectable } from '@angular/core';
import { UserRole } from 'src/app/enums/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private userRole: number = null;

  setUserRole(role: number) {
    this.userRole = role;
  }

  getUserRole(): number {
    return this.userRole;
  }

  isAdmin(): Boolean {
    return this.userRole === UserRole.admin;
  }

  isUser(): Boolean {
    return this.userRole === UserRole.user;
  }

  isServiceTechnician(): Boolean {
    return this.userRole === UserRole.service_technician;
  }
}
