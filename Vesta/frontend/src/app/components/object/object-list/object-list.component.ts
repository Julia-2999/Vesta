import { Component, OnInit, ViewChild } from '@angular/core';
import { BuildingService } from 'src/app/shared/services/building.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { AddObjectModalComponent } from '../../modals/add-object-modal/add-object-modal.component';
import { Building } from 'src/app/shared/models/building.model';
import { map } from 'rxjs/operators';
import { SearchService } from 'src/app/shared/services/search.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-object-list',
  templateUrl: './object-list.component.html',
  styleUrls: ['./object-list.component.css']
})
export class ObjectListComponent implements OnInit {

  @ViewChild(AddObjectModalComponent) addBuildingModal: AddObjectModalComponent;
  buildings?: Building[];

  filteredBuildings: Building[] = [];

  constructor(private buildingService: BuildingService,
        private authService: AuthService,
        private searchService: SearchService,
        private alertify: AlertifyService,
        public roleService: RoleService
      ) { }

  ngOnInit() {
    if (this.roleService.isUser) {
      this.getBuildingsList(this.authService.GetAvailableBuildingsIds());
    } else {
      this.getBuildingsList();
    }

    this.searchService.search$.subscribe(searchTerm => {
      this.filteredBuildings = this.filterBuildings(searchTerm);
    });
  };


  deleteBuilding(buildingId: string) {
    this.buildingService.deleteBuildingAndImage(buildingId)
      .then(() => {
        this.alertify.success('Pomyślnie usunięto obiekt');
      })
      .catch((error) => {
        this.alertify.error('Wystąpił błąd podczas usuwania obiektu');
        console.error('Wystąpił błąd podczas usuwania dokumentu:', error);
      });
  }

  getBuildingsList(availableBuildingIds: string = null){
    this.buildingService.getAllBuildings(availableBuildingIds).snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.buildings = data;
      this.filteredBuildings = this.buildings.slice();
    });
  }

  search(searchTerm: string) {
    this.searchService.updateSearch(searchTerm);
  }

  filterBuildings(searchTerm: string): Building[] {
    if (searchTerm) {
      return this.buildings.filter(building =>
        Object.values(building).some(field =>
          field && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      return this.buildings.slice();
    }
  }

  openModal() {
  this.addBuildingModal.open();
  return true;
  }

  modalClose(){
    this.addBuildingModal.close();
    this.getBuildingsList();
  }


}
