import { Component, OnInit, Input, TemplateRef, ViewChild } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BuildingServiceDoc } from 'src/app/shared/models/buildingServiceDoc.model';
import { BuildingService } from 'src/app/shared/services/building.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { ModalConfig } from 'src/app/shared/models/ModalConfig';
import { DocumentPriority, DocumentType, DocumentState } from 'src/app/enums/serice-doc.enum';
import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { map } from 'rxjs';
import { DatePipe } from '@angular/common';
import { RoleService } from 'src/app/shared/services/role.service';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-object-service-modal',
  templateUrl: './object-service-modal.component.html',
  styleUrls: ['./object-service-modal.component.css']
})
export class ObjectServiceModalComponent implements OnInit {

  @ViewChild('objectServiceModal')
  private modalContent: TemplateRef<ObjectServiceModalComponent>;
  @Input() public modalConfig: ModalConfig;
  private modalRef: NgbModalRef;

  serviceForm: UntypedFormGroup;
  submitted = false;
  service: BuildingServiceDoc;
  serviceId: string;
  objectId: string = '';
  serviceContractors: User[] = [];

  public docType = [
    { label: 'Serwis', value: DocumentType.service },
    { label: 'Konserwacja', value: DocumentType.maintenance },
    { label: 'Instalacja', value: DocumentType.instalation },
    { label: 'Modernizacja', value: DocumentType.modernization },
    { label: 'Demontaż', value: DocumentType.disassembly }];
  public docState = [
    { label: 'Nowe', value: DocumentState.new },
    { label: 'Oczekujące', value: DocumentState.waiting },
    { label: 'W trakcie realizacji', value: DocumentState.inProgress },
    { label: 'Zakończone', value: DocumentState.ended }];
  public docPriority = [
    { label: 'Krytyczny', value: DocumentPriority.critical },
    { label: 'Wysoki', value: DocumentPriority.high },
    { label: 'Średni', value: DocumentPriority.medium },
    { label: 'Niski', value: DocumentPriority.low }];


  constructor(
    private modalService: NgbModal,
    private buildingService: BuildingService,
    private roleService: RoleService,
    private authService: AuthService,
    private fb: UntypedFormBuilder,
    private alertify: AlertifyService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.createServiceForm();
    this.getContractors();
  }

  open(objectId?: string, service?: BuildingServiceDoc, serviceId?: string, modalEnabled: boolean = true): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.serviceId = serviceId;
      this.modalRef = this.modalService.open(this.modalContent);
      this.modalRef.result.then(resolve, resolve);
      this.objectId = objectId;

      if (!modalEnabled) {
        this.serviceForm.get('name').disable();
        this.serviceForm.get('type').disable();
        this.serviceForm.get('state').disable();
        this.serviceForm.get('priority').disable();
        this.serviceForm.get('contractor').disable();
        this.serviceForm.get('requirements').disable();
        this.serviceForm.get('newWorkEntry').disable();
        this.serviceForm.get('works').disable();
      }
      else {
        this.serviceForm.get('name').enable();
        this.serviceForm.get('type').enable();
        this.serviceForm.get('state').enable();
        this.serviceForm.get('priority').enable();
        this.serviceForm.get('contractor').enable();
        this.serviceForm.get('requirements').enable();
        this.serviceForm.get('newWorkEntry').enable();
        this.serviceForm.get('works').disable();
      }

      if (this.roleService.isServiceTechnician()) {
        this.serviceForm.get('name').disable();
        this.serviceForm.get('type').disable();
        this.serviceForm.get('priority').disable();
        this.serviceForm.get('contractor').disable();
        this.serviceForm.get('requirements').disable();
        this.serviceForm.get('works').disable();
      }
      else {
        this.serviceForm.get('newWorkEntry').disable();
        this.serviceForm.get('works').disable();
      }

      if (service != null) {
      this.serviceFormSetValue(service);
      }
    })
  }

  async closeModal(): Promise<void> {
    this.clearForm();
    this.modalRef.close();
  }

  getContractors(){
    this.authService.getContractorsForService().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.serviceContractors = data;
    });
  }

  createServiceForm()
  {
  this.serviceForm = this.fb.group({
    name: ['', Validators.required],
    type: [0, Validators.required],
    state: [0, Validators.required],
    priority: [3, Validators.required],
    contractor: ['', Validators.required],
    requirements: ['', Validators.required],
    works: ['', null],
    newWorkEntry: ['', null]
    })
  }

  get name(){
    return this.serviceForm.get('name') as UntypedFormControl;
  }
  get type(){
    return this.serviceForm.get('type') as UntypedFormControl;
  }
  get state(){
    return this.serviceForm.get('state') as UntypedFormControl;
  }
  get priority(){
    return this.serviceForm.get('priority') as UntypedFormControl;
  }
  get contractor(){
    return this.serviceForm.get('contractor') as UntypedFormControl;
  }
  get requirements(){
    return this.serviceForm.get('requirements') as UntypedFormControl;
  }
  get works(){
    return this.serviceForm.get('works') as UntypedFormControl;
  }
  get newWorkEntry(){
    return this.serviceForm.get('newWorkEntry') as UntypedFormControl;
  }

  onSubmit() {
    this.submitted = true;

    if (this.serviceForm.invalid) {
        return;
    }

    console.log('data' + this.serviceData());

    this.saveNewWorkEntry();

    if (this.serviceId == '' || this.serviceId == undefined){
      this.buildingService.addBuildingServiceDoc(this.serviceData()).then(
        () => {
            this.submitted = false;
            this.serviceForm.reset();
            this.alertify.success('Pomyślnie dodano serwis');

            this.closeModal();
        }
    );
    } else
    {

      this.buildingService.editBuildingServiceDoc(String(this.serviceId), this.serviceData()).then(() => {
        this.submitted = false;
        this.alertify.success('Pomyślnie zaktualizowano serwis');
        this.closeModal();
      }).catch((error) => {
        console.error('Błąd podczas aktualizacji serwisu'+ error);
        this.alertify.error('Nie udało się zaktualizować danych'+ error);
      });
    }
  }

  serviceFormSetValue(service: BuildingServiceDoc){
    this.serviceForm.setValue({
      name: service.name,
      type: service.type,
      state: service.state,
      priority: service.priority,
      contractor: service.contractor,
      requirements: service.requirementsDesc,
      works: service.worksDesc,
      newWorkEntry: ''
    })
    this.objectId = service.objectId;
  }

  serviceData(): BuildingServiceDoc {
    return this.service = {
      objectId: this.objectId,
      name: this.name.value,
      type: this.type.value,
      state: this.state.value,
      priority: this.priority.value,
      contractor: this.contractor.value,
      requirementsDesc: this.requirements.value,
      worksDesc: this.works.value
    };
  }

  saveNewWorkEntry() {
    const currentWorks = this.works.value || '';
    const newWorkEntry = this.newWorkEntry.value || '';

    if (newWorkEntry.trim() !== '') {
      const currentDate = new Date();
      const formattedDate = this.datePipe.transform(currentDate, 'yyyy-MM-dd HH:mm');

      const updatedWorks = currentWorks + (currentWorks ? '\n' : '') + formattedDate + ' | ' + newWorkEntry;

      this.works.setValue(updatedWorks);

      this.newWorkEntry.setValue('');
    }
  }

  getDefaultFormValues() {
    return {
      name: '',
      type: 0,
      state: 0,
      priority: 3,
      contractor: '',
      requirements: '',
      works: ''
    };
  }


  clearForm(){
    this.serviceForm.reset(this.getDefaultFormValues());
    this.submitted = false;
  }

}
