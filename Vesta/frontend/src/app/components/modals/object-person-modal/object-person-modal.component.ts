import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfig } from 'src/app/shared/models/ModalConfig';
import { BuildingPerson } from 'src/app/shared/models/buildingPerson.model';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { BuildingService } from 'src/app/shared/services/building.service';

@Component({
  selector: 'app-object-person-modal',
  templateUrl: './object-person-modal.component.html',
  styleUrls: ['./object-person-modal.component.css']
})
export class ObjectPersonModalComponent implements OnInit {

  @Input() public modalConfig: ModalConfig
  @ViewChild('objectPersonModal') private modalContent: TemplateRef<ObjectPersonModalComponent>
  private modalRef: NgbModalRef

  personForm: UntypedFormGroup;
  submitted = false;
  person: BuildingPerson;
  personId: string;
  objectId: string = '';


  constructor(private modalService: NgbModal,
    private buildingService: BuildingService,
    private alertify: AlertifyService,
    private fb: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.createPersonForm();
  }

  open(objectId?: string, person?: BuildingPerson, personId?: string, modalEnabled: boolean = true): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.personId = personId;
      this.modalRef = this.modalService.open(this.modalContent);
      this.modalRef.result.then(resolve, resolve);
      this.objectId = objectId;

      if (!modalEnabled) {
        this.personForm.get('displayName').disable();
        this.personForm.get('street').disable();
        this.personForm.get('number').disable();
        this.personForm.get('zipcode').disable();
        this.personForm.get('city').disable();
        this.personForm.get('email').disable();
        this.personForm.get('phone').disable();
        this.personForm.get('additionalInfo').disable();
        this.personForm.get('authorizationType').disable();
        this.personForm.get('authStartDate').disable();
        this.personForm.get('authEndDate').disable();
        this.personForm.get('role').disable();
      }
      else {
        this.personForm.get('displayName').enable();
        this.personForm.get('street').enable();
        this.personForm.get('number').enable();
        this.personForm.get('zipcode').enable();
        this.personForm.get('city').enable();
        this.personForm.get('email').enable();
        this.personForm.get('phone').enable();
        this.personForm.get('additionalInfo').enable();
        this.personForm.get('authorizationType').enable();
        this.personForm.get('authStartDate').enable();
        this.personForm.get('authEndDate').enable();
        this.personForm.get('role').enable();
      }

      if (person != null) {
      this.personFormSetValue(person);
      }
    })
  }

  async closeModal(): Promise<void> {
    this.clearForm();
    this.modalRef.close();
  }

  createPersonForm()
    {
    this.personForm = this.fb.group({
      displayName: ['', Validators.required],
      street: ['', Validators.required],
      number: [null, Validators.required],
      zipcode: [null, Validators.required],
      city: [null, Validators.required],
      email: [null, Validators.required],
      phone: [null, Validators.required],
      additionalInfo: [null, null],
      role: ['', null],
      authorizationType: ['unlimited', null],
      authStartDate: ['', null],
      authEndDate: ['', null]
      })
    }

    get displayName() {
      return this.personForm.get('displayName') as UntypedFormControl;
    }
    get street(){
      return this.personForm.get('street') as UntypedFormControl;
    }
    get number(){
      return this.personForm.get('number') as UntypedFormControl;
    }
    get zipcode(){
      return this.personForm.get('zipcode') as UntypedFormControl;
    }
    get city(){
      return this.personForm.get('city') as UntypedFormControl;
    }
    get email(){
      return this.personForm.get('email') as UntypedFormControl;
    }
    get phone(){
      return this.personForm.get('phone') as UntypedFormControl;
    }
    get additionalInfo(){
      return this.personForm.get('additionalInfo') as UntypedFormControl;
    }
    get authorizationType(){
      return this.personForm.get('authorizationType') as UntypedFormControl;
    }
    get authStartDate(){
      return this.personForm.get('authStartDate') as UntypedFormControl;
    }
    get authEndDate(){
      return this.personForm.get('authEndDate') as UntypedFormControl;
    }
    get role(){
      return this.personForm.get('role') as UntypedFormControl;
    }

  onSubmit() {
    this.submitted = true;
    const person = this.personData();

    if (this.personForm.invalid) {
        return;
    }

    if (this.personId == '' || this.personId == undefined) {
      this.buildingService.addBuildingPerson(person)
        .then(() => {
          this.submitted = false;
          this.personForm.reset();
          this.alertify.success('Pomyślnie dodano dane');
          this.clearForm();
          this.closeModal();
        })
        .catch(error => {
          this.alertify.error('Błąd podczas dodawania danych');
          console.error('Błąd podczas dodawania danych', error);
        });
    } else {
      this.buildingService.editBuildingPerson(this.personId, this.personData())
        .then(() => {
          this.submitted = false;
          this.personForm.reset();
          this.alertify.success('Pomyślnie zaktualizowano dane');
          this.clearForm();
          this.closeModal();
        })
        .catch(error => {
          this.alertify.error('Błąd podczas edycji danych');
          console.error('Błąd podczas edycji danych', error);
        });
    }
  }

  personFormSetValue(person: BuildingPerson){
    this.personForm.setValue({
      displayName: person.displayName,
      street: person.street,
      number: person.number,
      zipcode: person.zipcode,
      city: person.city,
      email: person.email,
      phone: person.phone,
      additionalInfo: person.additionalInfo,
      role: person.role,
      authorizationType: person.authorizationType,
      authStartDate: person.authStartDate,
      authEndDate: person.authEndDate
    })
  }

  personData(): BuildingPerson {
    return this.person = {
      objectId: this.objectId,
      displayName: this.displayName.value,
      street: this.street.value,
      number: this.number.value,
      zipcode: this.zipcode.value,
      city: this.city.value,
      email: this.email.value,
      phone: this.phone.value,
      additionalInfo: this.additionalInfo.value,
      role: this.role.value,
      authorizationType: this.authorizationType.value,
      authStartDate: this.authStartDate.value,
      authEndDate: this.authEndDate.value
    };
  }

  clearForm(){
    this.personForm.setValue({
      displayName: '',
      street: '',
      number: '',
      zipcode: '',
      city: '',
      email: '',
      phone: '',
      additionalInfo: '',
      role: '',
      authorizationType: 'unlimited',
      authStartDate: '',
      authEndDate: ''
    })
  }

}
