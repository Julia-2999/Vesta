import { Component, OnInit, Input, TemplateRef, ViewChild } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BuildingPlan } from 'src/app/shared/models/buildingPlan.model';
import { BuildingService } from 'src/app/shared/services/building.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { ModalConfig } from 'src/app/shared/models/ModalConfig';


@Component({
  selector: 'app-object-plan-modal',
  templateUrl: './object-plan-modal.component.html',
  styleUrls: ['./object-plan-modal.component.css']
})
export class ObjectPlanModalComponent implements OnInit {
  @ViewChild('objectPlanModal')
  private modalContent: TemplateRef<ObjectPlanModalComponent>;
  @Input() public modalConfig: ModalConfig;
  private modalRef: NgbModalRef;

  planForm: UntypedFormGroup;
  submitted = false;
  plan: BuildingPlan;
  planId: string;
  objectId: string = '';
  public imageUrl: string = '';
  selectedImage: File | null = null;

  constructor(
    private modalService: NgbModal,
    private buildingService: BuildingService,
    private fb: UntypedFormBuilder,
    private alertify: AlertifyService
  ) { }

  ngOnInit() {
    this.createPlanForm();
  }

  open(objectId?: string, plan?: BuildingPlan, planId?: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.planId = planId;
      this.modalRef = this.modalService.open(this.modalContent);
      this.modalRef.result.then(resolve, resolve);
      this.objectId = objectId;

      if (plan != null) {
      this.planFormSetValue(plan);
      }
    })
  }

  async closeModal(): Promise<void> {
    this.clearForm();
    this.modalRef.close();
  }

  createPlanForm()
    {
    this.planForm = this.fb.group({
      file: [null],
      description: ['', Validators.required],
      })
    }

  get description(){
    return this.planForm.get('description') as UntypedFormControl;
  }

  onSubmit() {
    this.submitted = true;

    if (this.planForm.invalid) {
        return;
    }
    if ((this.selectedImage == null) && (this.imageUrl == '')) {
      return;
    }

    if (this.planId == '' || this.planId == undefined){
      this.buildingService.addBuildingPlan(this.planData(), this.selectedImage).then(
        () => {
            this.submitted = false;
            this.planForm.reset();
            this.alertify.success('Pomyślnie dodano plan');

            this.closeModal();
        }
    );
    } else
    {
      this.buildingService.editBuildingPlan(String(this.planId), this.planData(), this.selectedImage).then(() => {
        this.submitted = false;
        this.alertify.success('Pomyślnie zaktualizowano plan');
        this.closeModal();
      }).catch((error) => {
        console.error('Błąd podczas aktualizacji planu');
        this.alertify.error('Nie udało się zaktualizować danych');
      });
    }
  }

  planFormSetValue(plan: BuildingPlan){
    this.imageUrl = plan.imageUrl;
    this.planForm.setValue({
      file: '',
      description: plan.description
    })
  }

  planData(): BuildingPlan {
    return this.plan = {
      objectId: this.objectId,
      description: this.description.value
    };
  }


  clearForm(){
    this.planForm.reset(undefined, { emitEvent: false });
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
