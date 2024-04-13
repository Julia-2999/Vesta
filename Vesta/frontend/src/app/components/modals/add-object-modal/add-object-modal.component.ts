import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Building } from 'src/app/shared/models/building.model';
import { BuildingService } from 'src/app/shared/services/building.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';

@Component({
  selector: 'app-add-object-modal',
  templateUrl: './add-object-modal.component.html',
  styleUrls: ['./add-object-modal.component.css'],
})
export class AddObjectModalComponent implements OnInit {
  @ViewChild('addBuildingModal')
  private modalContent: TemplateRef<AddObjectModalComponent>;
  private modalRef: NgbModalRef;

  addBuildingForm: UntypedFormGroup;
  selectedFile: File | null = null;
  submitted = false;
  building = new Building();

  constructor(
    private modalService: NgbModal,
    private fb: UntypedFormBuilder,
    private buildingService: BuildingService,
    private alertify: AlertifyService
  ) {}

  ngOnInit() {
    this.createaddBuildingForm();
  }

  open(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent);
      this.modalRef.result.then(resolve, resolve);
    });
  }

  close() {
    this.clearForm();
    this.modalRef.close();
  }

  createaddBuildingForm() {
    this.addBuildingForm = this.fb.group({
      objSynonym: [null, Validators.required],
      objName: [null, Validators.required],
      objStreet: [null, Validators.required],
      objNumber: [null, Validators.required],
      objCity: [null, Validators.required],
      objZipCode: [null, Validators.required],
      objEmail: [null, Validators.email],
      objPhone: [null, null],
      objAdditionalInfo: [null, null],
      objPhoto: [null, null],
    });
  }

  get objSynonym() {
    return this.addBuildingForm.get('objSynonym') as UntypedFormControl;
  }

  get objName() {
    return this.addBuildingForm.get('objName') as UntypedFormControl;
  }

  get objStreet() {
    return this.addBuildingForm.get('objStreet') as UntypedFormControl;
  }
  get objNumber() {
    return this.addBuildingForm.get('objNumber') as UntypedFormControl;
  }
  get objCity() {
    return this.addBuildingForm.get('objCity') as UntypedFormControl;
  }
  get objZipCode() {
    return this.addBuildingForm.get('objZipCode') as UntypedFormControl;
  }
  get objEmail() {
    return this.addBuildingForm.get('objEmail') as UntypedFormControl;
  }
  get objPhone() {
    return this.addBuildingForm.get('objPhone') as UntypedFormControl;
  }

  get objAdditionalInfo() {
    return this.addBuildingForm.get('objAdditionalInfo') as UntypedFormControl;
  }

  get objPhoto() {
    return this.addBuildingForm.get('objPhoto') as UntypedFormControl;
  }

  onSubmit() {
    this.submitted = true;

    if (this.addBuildingForm.invalid) {
      console.log('Formularz dodawania budynku jest nieprawidłowy');
      return;
    }

    if (this.submitted) {

      this.mapBuilding();

      this.buildingService.addBuilding(this.building, this.selectedFile).then(() => {
        console.log('Dodano obiekt');
        this.alertify.success('Pomyślnie dodano obiekt');
        this.close();

        this.building = new Building();
      });

    }
  }

  mapBuilding(): void {
    this.building.synonym = this.objSynonym.value;
    this.building.name = this.objName.value;
    this.building.street = this.objStreet.value;
    this.building.number = +this.objNumber.value;
    this.building.zipCode = this.objZipCode.value;
    this.building.city = this.objCity.value;
    this.building.email = this.objEmail.value;
    this.building.phone = this.objPhone.value;
    this.building.additionalInfo = this.objAdditionalInfo.value;
  }

  clearForm() {
    this.addBuildingForm.reset(undefined, { emitEvent: false });
    this.selectedFile = null;
    this.submitted = false;
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }
}
