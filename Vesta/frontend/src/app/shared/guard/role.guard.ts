import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { RoleService } from '../services/role.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private roleService: RoleService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole: number = route.data.expectedRole;

    if (expectedRole === undefined) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    const userRole: number = this.roleService.getUserRole();
    if (userRole !== undefined && userRole !== null && userRole <= expectedRole) {
      return true;
    } else {
      this.router.navigate(['/unauthorized']);
      return false;
    }
  }
}
