import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { BuildingService } from 'src/app/shared/services/building.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { Building } from 'src/app/shared/models/building.model';
import { RoleService } from 'src/app/shared/services/role.service';


@Component({
  selector: 'app-object-info',
  templateUrl: './object-info.component.html',
  styleUrls: ['./object-info.component.css']
})
export class ObjectInfoComponent implements OnInit {

  objectInfoForm: UntypedFormGroup;
  submitted: boolean;

  public buildingId: string;
  public buildingData: Building = null;;
  public imageUrl: string;
  selectedImage: File | null = null;


  constructor(
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private buildingService: BuildingService,
    private alertify: AlertifyService,
    public roleService: RoleService
    ) {}

  ngOnInit() {
    this.buildingId = this.route.snapshot.params['id'];
    this.initObjectInfoForm();
    this.loadBuildingData();

    if (this.roleService.isAdmin()) {
      this.objectInfoForm.get('objSynonym').enable();
      this.objectInfoForm.get('objName').enable();
      this.objectInfoForm.get('objStreet').enable();
      this.objectInfoForm.get('objNumber').enable();
      this.objectInfoForm.get('objCity').enable();
      this.objectInfoForm.get('objZipCode').enable();
      this.objectInfoForm.get('objEmail').enable();
      this.objectInfoForm.get('objPhone').enable();
      this.objectInfoForm.get('objAdditionalInfo').enable();
    }
    else
    {
      this.objectInfoForm.get('objSynonym').disable();
      this.objectInfoForm.get('objName').disable();
      this.objectInfoForm.get('objStreet').disable();
      this.objectInfoForm.get('objNumber').disable();
      this.objectInfoForm.get('objCity').disable();
      this.objectInfoForm.get('objZipCode').disable();
      this.objectInfoForm.get('objEmail').disable();
      this.objectInfoForm.get('objPhone').disable();
      this.objectInfoForm.get('objAdditionalInfo').disable();
    }

  }

  get objSynonym() {
    return this.objectInfoForm.get('objSynonym') as UntypedFormControl;
  }
  get objName(){
    return this.objectInfoForm.get('objName') as UntypedFormControl;
  }
  get objStreet(){
    return this.objectInfoForm.get('objStreet') as UntypedFormControl;
  }
  get objNumber(){
    return this.objectInfoForm.get('objNumber') as UntypedFormControl;
  }
  get objCity(){
    return this.objectInfoForm.get('objCity') as UntypedFormControl;
  }
  get objZipCode(){
    return this.objectInfoForm.get('objZipCode') as UntypedFormControl;
  }
  get objEmail(){
    return this.objectInfoForm.get('objEmail') as UntypedFormControl;
  }
  get objPhone(){
    return this.objectInfoForm.get('objPhone') as UntypedFormControl;
  }
  get objAdditionalInfo() {
    return this.objectInfoForm.get('objAdditionalInfo') as UntypedFormControl;
  }



  initObjectInfoForm(){
    this.objectInfoForm = this.fb.group({
      objSynonym: ['', Validators.required],
      objName: ['', Validators.required],
      objStreet: ['', Validators.required],
      objNumber: ['', Validators.required],
      objCity: ['', Validators.required],
      objZipCode: ['', Validators.required],
      objEmail: [''],
      objPhone: [''],
      objAdditionalInfo: [''],
      objPhoto: [null]
    })
  }

loadBuildingData() {
  this.buildingService.getBuildingData(this.buildingId.toString()).subscribe({
    next: (data: any) => {
      if (data) {
        this.buildingData = data;
        this.imageUrl = data.imageUrl;


        this.objectInfoForm.patchValue({
          objSynonym: data.synonym,
          objName: data.name,
          objStreet: data.street,
          objNumber: data.number,
          objCity: data.city,
          objZipCode: data.zipCode,
          objEmail: data.email,
          objPhone: data.phone,
          objAdditionalInfo: data.additionalInfo
        });
      } else {
        console.error('Pobrane dane są puste.');
      }
    },
    error: (error) => {
      console.error('Błąd podczas pobierania danych z Firebase', error);
    }
  });
}


onSubmit() {
  if (this.objectInfoForm && this.objectInfoForm.valid) {
    this.mapBuilding();

    this.buildingService.editBuildingInfo(String(this.buildingId), this.buildingData, this.selectedImage).then(() => {
      this.submitted = false;
      this.alertify.success('Pomyślnie zaktualizowano obiekt');
    }).catch((error) => {
      console.error('Błąd podczas aktualizacji obiektu', error);
      this.alertify.error('Nie udało się zaktualizować danych');
    });
  } else {
    this.alertify.error('Nie udało się zaktualizować danych');
  }
}


mapBuilding(): void {
    this.buildingData.synonym = this.objSynonym.value;
    this.buildingData.name = this.objName.value;
    this.buildingData.street = this.objStreet.value;
    this.buildingData.number = this.objNumber.value;
    this.buildingData.zipCode = this.objZipCode.value;
    this.buildingData.city = this.objCity.value;
    this.buildingData.email = this.objEmail.value;
    this.buildingData.phone = this.objPhone.value;
    this.buildingData.additionalInfo = this.objAdditionalInfo.value;
}

onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  this.selectedImage = event.target.files[0];
}


}
