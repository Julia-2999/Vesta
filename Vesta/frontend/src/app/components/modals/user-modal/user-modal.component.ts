import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfig } from 'src/app/shared/models/ModalConfig';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/models/user.model';
import { UserRole } from 'src/app/enums/user-role.enum';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { BuildingService } from 'src/app/shared/services/building.service';
import { Building } from 'src/app/shared/models/building.model';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css']
})
export class UserModalComponent implements OnInit {

  @Input() public modalConfig: ModalConfig
  @ViewChild('userModal') private modalContent: TemplateRef<UserModalComponent>
  private modalRef: NgbModalRef

  userForm: UntypedFormGroup;

  submitted = false;
  user: User;
  userId: string;
  availableBuildings: Building[] = [];
  userRoles = [
    { label: 'Administrator', value: UserRole.admin },
    { label: 'Użytkownik', value: UserRole.user },
    { label: 'Serwisant', value: UserRole.service_technician }
  ];

  constructor(private modalService: NgbModal,
    private authService: AuthService,
    private alertify: AlertifyService,
    private fb: UntypedFormBuilder,
    public buildingService: BuildingService) { }

  ngOnInit(): void {
    this.getBuildingList();
    this.createUserForm();
  }

  getBuildingList(){
    this.buildingService.getAllBuildings().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.availableBuildings = data;
    });
  }

  open(user?: User, userId?: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.userId = userId;
      this.modalRef = this.modalService.open(this.modalContent);
      this.modalRef.result.then(resolve, resolve);

      if (user != null) {
      this.userFormSetValue(user);
      }
    })
  }

  async close(): Promise<void> {
    this.clearForm();
    this.modalRef.close();
  }

  createUserForm() {
    this.userForm = this.fb.group({
      displayName: [null, Validators.required],
      email: [null, Validators.required],
      role: [0, Validators.required],
      selectedBuildings: ['', null]
      })
    }

  get displayName() {
    return this.userForm.get('displayName') as UntypedFormControl;
  }
  get email(){
    return this.userForm.get('email') as UntypedFormControl;
  }
  get role(){
    return this.userForm.get('role') as UntypedFormControl;
  }

  selectedBuildingIds(): string {
    const selectedBuildingsControl = this.userForm.get('selectedBuildings');
    const selectedBuildingIdsArray: string[] = selectedBuildingsControl ? selectedBuildingsControl.value || [] : [];

    const selectedBuildingIdsString = selectedBuildingIdsArray.join(',');

    return selectedBuildingIdsString;
  }

  selectedBuildingIdsAsArray(availableBuildingIds: string): string[] {
    if (!availableBuildingIds || availableBuildingIds.trim() === '') {
      return [];
    }

    const availableBuildingIdsArray = availableBuildingIds.split(',');
    return availableBuildingIdsArray;
  }

  onSubmit() {
    this.submitted = true;
    const user = this.userData();
    if (this.userForm.invalid) {
        return;
    }

    if (this.userId == '' || this.userId == undefined) {
      this.authService.addUser(user)
        .then(() => {
          this.submitted = false;
          this.userForm.reset();
          this.alertify.success('Pomyślnie dodano użytkownika');
          this.clearForm();
          this.close();
        })
        .catch(error => {
          this.alertify.error('Błąd podczas dodawania użytkownika');
          console.error('Błąd podczas dodawania użytkownika', error);
        });
    } else {
      this.authService.editUser(this.userId, this.userData())
        .then(() => {
          console.log('Edycja użytkownika')
          this.submitted = false;
          this.userForm.reset();
          this.alertify.success('Pomyślnie zaktualizowano użytkownika');
          this.clearForm();
          this.close();
        })
        .catch(error => {
          this.alertify.error('Błąd podczas edycji użytkownika');
          console.error('Błąd podczas edycji użytkownika', error);
        });
    }
  }

  userFormSetValue(user: User){
    this.userForm.setValue({displayName: user.displayName,
      email: user.email,
      role: user.role,
      selectedBuildings: this.selectedBuildingIdsAsArray(user.availableBuildingIds)
    })
  }

  userData(): User {
    return this.user = {
      email: this.email.value,
      displayName: this.displayName.value,
      role: this.role.value,
      availableBuildingIds: this.selectedBuildingIds()
    };
  }

  clearForm(){
    this.userForm.setValue({
      displayName: '',
      email: '',
      role: 0,
      selectedBuildings: ''
    })
  }

}


