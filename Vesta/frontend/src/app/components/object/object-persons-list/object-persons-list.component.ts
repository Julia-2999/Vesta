import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { map } from 'rxjs';
import { ModalConfig } from 'src/app/shared/models/ModalConfig';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { BuildingService } from 'src/app/shared/services/building.service';
import { BuildingPerson } from 'src/app/shared/models/buildingPerson.model';
import { ObjectPersonModalComponent } from '../../modals/object-person-modal/object-person-modal.component';
import { SearchService } from 'src/app/shared/services/search.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { Building } from 'src/app/shared/models/building.model';

@Component({
  selector: 'app-object-persons-list',
  templateUrl: './object-persons-list.component.html',
  styleUrls: ['./object-persons-list.component.css']
})
export class ObjectPersonsListComponent implements OnInit {

  @Input() public modalConfig: ModalConfig;
  @ViewChild(ObjectPersonModalComponent) personView: ObjectPersonModalComponent;

  persons: BuildingPerson[];
  filteredPersons: BuildingPerson[] = [];
  buildingId: string;
  isButtonVisible: Boolean = true;
  buildingData: Building = null;;

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
    this.getPersonsList();

    this.searchService.search$.subscribe(searchTerm => {
      this.filteredPersons = this.filterPersons(searchTerm);
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

  deletePerson(personId: string) {
    this.buildingService.deleteBuildingPerson(personId.toString())
      .then(() => {
        this.alertify.success('Pomyślnie usunięto osobę');
        console.log('Osoba został usunięty');
        this.getPersonsList();
      })
      .catch((error) => {
        this.alertify.error('Wystąpił błąd podczas usuwania osoby');
        console.error('Wystąpił błąd podczas usuwania osoby:', error);
      });
  }

  editPerson(person: BuildingPerson) {
    this.openModal('edit', person, person.id);
  }

  openModal(event: string, person?: BuildingPerson, personId?: string) {
    this.isButtonVisible = true;
    if (event == 'add') {
    this.modalConfig = {
      modalTitle: 'Nowa osoba'
      };
      this.personView.open(this.buildingId);
    }
    else if (event == 'edit') {
      this.modalConfig = {
        modalTitle: 'Edycja danych osoby'
        };
      this.personView.open(this.buildingId, person, personId);
    }
    else if (event == 'view') {
      this.modalConfig = {
        modalTitle: 'Podgląd danych osoby'
        };
      this.personView.open(this.buildingId, person, personId, false);
      this.isButtonVisible = false;
      }
    return true;
  }

  getPersonsList(){
    this.buildingService.getAllBuildingPersons(this.buildingId).snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.persons = data;
      this.filteredPersons = this.persons.slice();
    });
  }

  search(searchTerm: string) {
    this.searchService.updateSearch(searchTerm);
  }

  filterPersons(searchTerm: string): BuildingPerson[] {
    if (searchTerm) {
      return this.persons.filter(plan =>
        Object.values(plan).some(field =>
          field && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      return this.persons.slice();
    }
  }

  modalClose(){
    this.personView.closeModal();
    this.getPersonsList();
  }
}
