import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ObjectServiceModalComponent } from '../modals/object-service-modal/object-service-modal.component';
import { BuildingService } from 'src/app/shared/services/building.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { map } from 'rxjs/operators';
import { ModalConfig } from 'src/app/shared/models/ModalConfig';
import { BuildingServiceDoc } from 'src/app/shared/models/buildingServiceDoc.model';
import { SearchService } from 'src/app/shared/services/search.service';
import { DocumentPriority, DocumentType, DocumentState } from 'src/app/enums/serice-doc.enum';
import { RoleService } from 'src/app/shared/services/role.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Building } from 'src/app/shared/models/building.model';

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.css']
})
export class ServicesListComponent implements OnInit {

  @Input() public modalConfig: ModalConfig;
  @ViewChild(ObjectServiceModalComponent) serviceView: ObjectServiceModalComponent;

  services: BuildingServiceDoc[];
  filteredServices: BuildingServiceDoc[] = [];
  buildingId: string = '';
  isButtonVisible: Boolean = true;
  contractorId: string = '';
  buildingData: Building = null;
  getServicesList: () => void = this.getAllServicesList.bind(this);

  constructor(
    private buildingService: BuildingService,
    private searchService: SearchService,
    private authService: AuthService,
    public roleService: RoleService,
    private route: ActivatedRoute,
    private alertify: AlertifyService
  ) { }

  ngOnInit() {
    const currentPath = this.route.snapshot.routeConfig.path;

    if (currentPath === 'services') {
      this.contractorId = this.authService.getLoggedUserID;
      this.getServicesList = this.getServicesListToProperContractor.bind(this);
    } else {
      this.buildingId = this.route.snapshot.params['id'];
      this.loadBuildingData();
      this.getServicesList = this.getAllServicesList.bind(this);
    }

    this.getServicesList();

    this.searchService.search$.subscribe(searchTerm => {
      this.filteredServices = this.filterServices(searchTerm);
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

  deleteServiceDoc(serviceId: string) {
    this.buildingService.deleteServiceDoc(serviceId.toString())
      .then(() => {
        this.alertify.success('Pomyślnie usunięto dokument');
        console.log('Dokument został usunięty');
        this.getServicesList();
      })
      .catch((error) => {
        this.alertify.error('Wystąpił błąd podczas usuwania dokumentu');
        console.error('Wystąpił błąd podczas usuwania dokumentu:', error);
      });
  }

  editService(service: BuildingServiceDoc) {
    this.openModal('edit', service, service.id);
  }

  openModal(event: string, service?: BuildingServiceDoc, serviceId?: string) {
    this.isButtonVisible = true;
    if (event == 'add') {
    this.modalConfig = {
      modalTitle: 'Nowy dokument serwisowy'
      };
      this.serviceView.open(this.buildingId);
    }
    else if (event == 'edit') {
      this.modalConfig = {
        modalTitle: 'Edycja dokumentu serwisowego'
        };
      this.serviceView.open(this.buildingId, service, serviceId);
    }
    else if (event == 'view') {
      this.modalConfig = {
        modalTitle: 'Dokument serwisowy'
        };
      this.serviceView.open(this.buildingId, service, serviceId, false);
      this.isButtonVisible = false;
    }
    return true;
  }

  getAllServicesList(){
    this.buildingService.getAllBuildingServiceDocs(this.buildingId).snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.services = data;
      this.filteredServices = this.services.slice();
    });
  }

  getServicesListToProperContractor(){
    this.buildingService.getServicesForProperContractor(this.contractorId).snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.services = data;
      this.filteredServices = this.services.slice();
    })
  }

  search(searchTerm: string) {
    this.searchService.updateSearch(searchTerm);
  }

  filterServices(searchTerm: string): BuildingServiceDoc[] {
    if (searchTerm) {
      return this.services.filter(plan =>
        Object.values(plan).some(field =>
          field && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      return this.services.slice();
    }
  }

  showServiceDocType(docType: number): string {
    const serviceDocTypes: Record<number, string> = {
      [DocumentType.service]: 'Serwis',
      [DocumentType.maintenance]: 'Konserwacja',
      [DocumentType.instalation]: 'Instalacja',
      [DocumentType.modernization ]: 'Modernizacja',
      [DocumentType.disassembly]: 'Demontaż'
    };

    return serviceDocTypes[docType] || 'Nieznany typ';
  }

  showServiceDocPriority(docPriority: number): string {
    const serviceDocPriorities: Record<number, string> = {
      [DocumentPriority.critical]: 'Krytyczny',
      [DocumentPriority.high]: 'Wysoki',
      [DocumentPriority.medium]: 'Średni',
      [DocumentPriority.low ]: 'Niski'
    };

    return serviceDocPriorities[docPriority] || 'Nieznany priorytet';
  }

  showServiceDocState(docState: number): string {
    const serviceDocStates: Record<number, string> = {
      [DocumentState.new]: 'Nowe',
      [DocumentState.waiting]: 'Oczekujące',
      [DocumentState.inProgress]: 'W trakcie realizacji',
      [DocumentState.ended]: 'Zakończone'
    };

    return serviceDocStates[docState] || 'Nieznany status';
  }

  modalClose(){
    this.serviceView.closeModal();
    this.getServicesList();
  }

}
