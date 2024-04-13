import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BuildingService } from 'src/app/shared/services/building.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { ModalConfig } from 'src/app/shared/models/ModalConfig';
import { BuildingDevice } from 'src/app/shared/models/buildingDevice.model';
import { RoleService } from 'src/app/shared/services/role.service';

@Component({
  selector: 'app-object-device-modal',
  templateUrl: './object-device-modal.component.html',
  styleUrls: ['./object-device-modal.component.css']
})
export class ObjectDeviceModalComponent implements OnInit {

  @ViewChild('objectDeviceModal')
  private modalContent: TemplateRef<ObjectDeviceModalComponent>;
  @Input() public modalConfig: ModalConfig;
  private modalRef: NgbModalRef;

  objectDeviceForm: UntypedFormGroup;
  submitted = false;
  device: BuildingDevice;
  deviceId: string;
  objectId: string = '';
  public imageUrl: string = '';
  selectedImage: File | null = null;
  modalEnabled: Boolean = true;

  constructor(
    private modalService: NgbModal,
    private buildingService: BuildingService,
    public roleService: RoleService,
    private fb: UntypedFormBuilder,
    private alertify: AlertifyService
  ) { }

  ngOnInit() {
    this.createDeviceForm();
  }

  open(objectId?: string, device?: BuildingDevice, deviceId?: string, modalEnabled: boolean = true): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.deviceId = deviceId;
      this.modalRef = this.modalService.open(this.modalContent);
      this.modalRef.result.then(resolve, resolve);
      this.objectId = objectId;
      this.modalEnabled = modalEnabled;

      if (!modalEnabled) {
        this.objectDeviceForm.get('name').disable();
        this.objectDeviceForm.get('rtspUrl').disable();
        this.objectDeviceForm.get('producer').disable();
        this.objectDeviceForm.get('model').disable();
        this.objectDeviceForm.get('serialNumber').disable();
      }
      else {
        this.objectDeviceForm.get('name').enable();
        this.objectDeviceForm.get('rtspUrl').enable();
        this.objectDeviceForm.get('model').enable();
        this.objectDeviceForm.get('serialNumber').enable();
      }

      if (device != null) {
      this.deviceFormSetValue(device);
      }
    })
  }

  async closeModal(): Promise<void> {
    this.clearForm();
    this.modalRef.close();
  }

  createDeviceForm()
    {
    this.objectDeviceForm = this.fb.group({
      file: [null],
      name: ['', Validators.required],
      rtspUrl: ['', Validators.required],
      producer: [null],
      model: [null],
      serialNumber: [null]
      })
    }

  get name() {
    return this.objectDeviceForm.get('name') as UntypedFormControl;
  }
  get rtspUrl() {
    return this.objectDeviceForm.get('rtspUrl') as UntypedFormControl;
  }
  get producer(){
    return this.objectDeviceForm.get('producer') as UntypedFormControl;
  }
  get model(){
    return this.objectDeviceForm.get('model') as UntypedFormControl;
  }
  get serialNumber(){
    return this.objectDeviceForm.get('serialNumber') as UntypedFormControl;
  }

  onSubmit() {
    this.submitted = true;
    if (this.objectDeviceForm.invalid) {
        return;
    }
    if ((this.selectedImage == null) && (this.imageUrl == '')) {
      return;
    }

    if (this.deviceId == '' || this.deviceId == undefined){
      this.buildingService.addBuildingDevice(this.deviceData(), this.selectedImage).then(
        () => {
            this.submitted = false;
            this.objectDeviceForm.reset();
            this.alertify.success('Pomyślnie dodano urządzenie');

            this.closeModal();
        }
    );
    } else
    {
      this.buildingService.editBuildingDevice(String(this.deviceId), this.deviceData(), this.selectedImage).then(() => {
        this.submitted = false;
        this.alertify.success('Pomyślnie zaktualizowano dane urządzenia');
        this.closeModal();
      }).catch((error) => {
        console.error('Błąd podczas aktualizacji danych urządzenia');
        this.alertify.error('Nie udało się zaktualizować danych');
      });
    }
  }

  deviceFormSetValue(device: BuildingDevice){
    this.imageUrl = device.imageUrl;

    this.objectDeviceForm.setValue({
      file: '',
      name: device.name,
      rtspUrl: device.rtspUrl,
      producer: device.producer,
      model: device.model,
      serialNumber: device.serialNumber
    })
  }

  deviceData(): BuildingDevice {
    return this.device = {
      objectId: this.objectId,
      name: this.name.value,
      rtspUrl: this.rtspUrl.value,
      producer: this.producer.value,
      model: this.model.value,
      serialNumber: this.serialNumber.value
    };
  }


  clearForm(){
    this.objectDeviceForm.reset(undefined, { emitEvent: false });
    this.selectedImage = null;
    this.submitted = false;
    this.imageUrl = '';
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
