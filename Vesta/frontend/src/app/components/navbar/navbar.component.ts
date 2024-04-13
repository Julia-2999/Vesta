import { Component} from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { UserRole } from 'src/app/enums/user-role.enum';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  UserRole = UserRole;

  constructor(public authService: AuthService,
      public roleService: RoleService) { }


  LogOut(){
    this.authService.SignOut();
  }

  isAdmin(): boolean{
    let userRoleNumber: number = UserRole.admin;
    return this.roleService.getUserRole() === userRoleNumber;
  }

}
