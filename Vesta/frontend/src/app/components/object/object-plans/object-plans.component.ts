import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { BuildingService } from 'src/app/shared/services/building.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { BuildingPlan } from 'src/app/shared/models/buildingPlan.model';
import { ObjectPlanModalComponent } from '../../modals/object-plan-modal/object-plan-modal.component';
import { map } from 'rxjs/operators';
import { ModalConfig } from 'src/app/shared/models/ModalConfig';
import { SearchService } from 'src/app/shared/services/search.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { Building } from 'src/app/shared/models/building.model';

@Component({
  selector: 'app-object-plans',
  templateUrl: './object-plans.component.html',
  styleUrls: ['./object-plans.component.css']
})
export class ObjectPlansComponent implements OnInit {

  @Input() public modalConfig: ModalConfig;
  @ViewChild(ObjectPlanModalComponent) planView: ObjectPlanModalComponent;

  plans: BuildingPlan[];
  filteredPlans: BuildingPlan[] = [];
  buildingId: string;
  buildingData: Building = null;

  constructor(
    private buildingService: BuildingService,
    private searchService: SearchService,
    private route: ActivatedRoute,
    private alertify: AlertifyService,
    public roleService: RoleService
    ) { }

  ngOnInit() {
    this.buildingId = this.route.snapshot.params['id'];
    this.loadBuildingData();
    this.getPlansList();

    this.searchService.search$.subscribe(searchTerm => {
      this.filteredPlans = this.filterPlans(searchTerm);
    });
  }

  loadBuildingData() {
    this.buildingService.getBuildingData(this.buildingId.toString()).subscribe({
      next: (data: any) => {
        if (data) {
          this.buildingData = data;
        } else {
          console.error('Pobrane dane są puste.');
        }
      },
      error: (error) => {
        console.error('Błąd podczas pobierania danych z Firebase', error);
      }
    });
  }

  deletePlan(planId: string) {
    this.buildingService.deletePlanAndImage(planId.toString())
      .then(() => {
        this.alertify.success('Pomyślnie usunięto plan');
        console.log('Plan został usunięty');
        this.getPlansList();
      })
      .catch((error) => {
        this.alertify.error('Wystąpił błąd podczas usuwania planu');
        console.error('Wystąpił błąd podczas usuwania planu:', error);
      });
  }

  editPlan(plan: BuildingPlan) {
    this.openModal('edit', plan, plan.id);
  }

  openModal(event: string, plan?: BuildingPlan, planId?: string) {

    if (event == 'add') {
    this.modalConfig = {
      modalTitle: 'Nowy plan'
      };
      this.planView.open(this.buildingId);
    }
    else if (event == 'edit') {
      this.modalConfig = {
        modalTitle: 'Edycja planu'
        };
      this.planView.open(this.buildingId, plan, planId);
    }
    return true;
  }

  getPlansList(){
    this.buildingService.getAllBuildingPlans(this.buildingId).snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.plans = data;
      this.filteredPlans = this.plans.slice();
    });
  }

  search(searchTerm: string) {
    this.searchService.updateSearch(searchTerm);
  }

  filterPlans(searchTerm: string): BuildingPlan[] {
    if (searchTerm) {
      return this.plans.filter(plan =>
        Object.values(plan).some(field =>
          field && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      return this.plans.slice();
    }
  }

  modalClose(){
    this.planView.closeModal();
    this.getPlansList();
  }

}
