import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserModalComponent } from '../modals/user-modal/user-modal.component';
import { ModalConfig } from 'src/app/shared/models/ModalConfig';
import { User } from 'src/app/shared/models/user.model';
import { map } from 'rxjs/operators';
import { UserRole } from 'src/app/enums/user-role.enum';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { SearchService } from 'src/app/shared/services/search.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  @ViewChild(UserModalComponent) addView: UserModalComponent;

  modalConfig: ModalConfig;
  users: User[];
  filteredUsers: User[] = [];


  constructor(private authService: AuthService,
    private searchService: SearchService,
    private alertify: AlertifyService) {}

  ngOnInit() {
    this.getUserList();

    this.searchService.search$.subscribe(searchTerm => {
      this.filteredUsers = this.filterUsers(searchTerm);
    });
  }

  deleteUser(userId: string): void {
    this.authService.deleteUser(userId)
      .then(() => {
        console.log('Użytkownik został pomyślnie usunięty.');
        this.alertify.success('Użytkownik został pomyślnie usunięty');
        this.getUserList();
      })
      .catch(error => {
        this.alertify.error('Błąd podczas usuwania użytkownika');
        console.error('Błąd podczas usuwania użytkownika:', error);
      });
  }

  openModal(event: string, user?: User, userId?: number) {
    if (event == 'add') {
    this.modalConfig = {
      modalTitle: 'Nowy użytkownik'
      };
      this.addView.open();
    }
    else {
      this.modalConfig = {
        modalTitle: 'Edycja użytkownika'
        };
      this.addView.open(user, userId.toString());
    }
    return true;
  }

  getUserList(){
    this.authService.GetAllUsers().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.users = data;
      this.filteredUsers = this.users.slice();
    });
  }

  showUserRole(role: number): string {
    const roleNames: Record<number, string> = {
      [UserRole.admin]: 'Administrator',
      [UserRole.user]: 'Użytkownik',
      [UserRole.service_technician]: 'Serwisant'
    };

    return roleNames[role] || 'Nieznana rola';
  }

  search(searchTerm: string) {
    this.searchService.updateSearch(searchTerm);
  }

  filterUsers(searchTerm: string): User[] {
    if (searchTerm) {
      return this.users.filter(user =>
        Object.values(user).some(field =>
          field && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      return this.users.slice();
    }
  }

  modalClose(){
    this.addView.close();
    this.getUserList();
  }

}


