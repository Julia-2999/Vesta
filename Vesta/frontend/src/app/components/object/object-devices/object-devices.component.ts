import { Component, OnInit, ViewChild } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ModalConfig } from 'src/app/shared/models/ModalConfig';
import { BuildingDevice } from 'src/app/shared/models/buildingDevice.model';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { BuildingService } from 'src/app/shared/services/building.service';
import { ObjectDeviceModalComponent } from '../../modals/object-device-modal/object-device-modal.component';
import { RoleService } from 'src/app/shared/services/role.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { Building } from 'src/app/shared/models/building.model';

@Component({
  selector: 'app-object-devices',
  templateUrl: './object-devices.component.html',
  styleUrls: ['./object-devices.component.css']
})
export class ObjectDevicesComponent implements OnInit {

@ViewChild(ObjectDeviceModalComponent) objectDeviceModal: ObjectDeviceModalComponent;

  devices: BuildingDevice[];
  filteredDevices:  BuildingDevice[] = [];
  modalConfig: ModalConfig;
  buildingId: string;
  isButtonVisible: Boolean = true;
  buildingData: Building = null;;


  constructor(
    private buildingService: BuildingService,
    private alertify: AlertifyService,
    private route: ActivatedRoute,
    private searchService: SearchService,
    public roleService: RoleService
    ) {}

  ngOnInit() {
    this.buildingId = this.route.snapshot.params['id'];
    this.loadBuildingData();
    this.getObjectDevicesList();

    this.searchService.search$.subscribe(searchTerm => {
      this.filteredDevices = this.filterDevices(searchTerm);
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

  deleteDevice(deviceId: number) {
    this.buildingService.deleteBuildingAndImage(deviceId.toString())
      .then(() => {
        this.alertify.success('Pomyślnie usunięto urządzenie');
        console.log('Urzadzenie został usunięty.');
        this.getObjectDevicesList();
      })
      .catch((error) => {
        this.alertify.error('Wystąpił błąd podczas usuwania urządzenia:' + error);
        console.error('Wystąpił błąd podczas usuwania urządzenia:', error);
      });

  }

  openModal(event: string, device?: BuildingDevice, deviceId?: number) {
    this.isButtonVisible = true;
    if (event == 'add') {
    this.modalConfig = {
      modalTitle: 'Nowe urządzenie'
      };
      this.objectDeviceModal.open(this.buildingId);
    }
    else if (event == 'edit') {
      this.modalConfig = {
        modalTitle: 'Edycja danych urządzenia'
        };
      this.objectDeviceModal.open(this.buildingId, device, deviceId.toString());
    }
    else if (event == 'view') {
      this.modalConfig = {
        modalTitle: 'Dane urządzenia'
        };
      this.objectDeviceModal.open(this.buildingId, device, deviceId.toString(), false);
      this.isButtonVisible = false;
    }
    return true;
  }

  getObjectDevicesList(){
    this.buildingService.getAllBuildingDevices(this.buildingId).snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.devices = data;
      this.filteredDevices = this.devices.slice();
    });
  }

  search(searchTerm: string) {
    this.searchService.updateSearch(searchTerm);
  }

  filterDevices(searchTerm: string): BuildingDevice[] {
    if (searchTerm) {
      return this.devices.filter(plan =>
        Object.values(plan).some(field =>
          field && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      return this.devices.slice();
    }
  }

  modalClose(){
    this.objectDeviceModal.closeModal();
    this.getObjectDevicesList();
  }

}
