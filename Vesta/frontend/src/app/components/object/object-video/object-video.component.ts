import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { BuildingService } from 'src/app/shared/services/building.service';
import { BuildingDevice } from 'src/app/shared/models/buildingDevice.model';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Building } from 'src/app/shared/models/building.model';
import { StreamService } from 'src/app/shared/services/stream.service';
import JSMpeg from 'jsmpeg-player'

declare var JSMpeg: any;

@Component({
  selector: 'app-object-video',
  templateUrl: './object-video.component.html',
  styleUrls: ['./object-video.component.css']
})
export class ObjectVideoComponent implements OnInit, OnDestroy {

  cameras: BuildingDevice[] = [];
  selectedCamera: BuildingDevice | null = null;
  buildingId: string;
  buildingData: Building = null;
  @ViewChild('streaming', { static: false }) streamingcanvas: ElementRef;
  private player: any;
  private webSocket = null;

  constructor(
    private route: ActivatedRoute,
    private buildingService: BuildingService,
    private streamService: StreamService) {
  }

  ngOnInit(): void {
    this.buildingId = this.route.snapshot.params['id'];
    this.loadBuildingData();
    this.loadCameras();
  }

  ngOnDestroy(): void {
    console.log('destroy player and stream')
    if (this.player){
      this.player.stop();
      this.player.destroy();

      if (this.webSocket instanceof WebSocket) {
        this.webSocket.close();
      }
    }

    this.stopStream();
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

  loadCameras(): void {
    this.buildingService.getAllBuildingDevices(this.buildingId).snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.cameras = data;

      if (this.cameras.length > 0) {
        this.selectedCamera = this.cameras[0];
        this.initializeJSMpeg();
      }
    });
  }

  initializeJSMpeg(): void {
    const rtspUrl = this.selectedCamera.rtspUrl;

    this.streamService.startStream(rtspUrl).subscribe({
      next: (response) => {
        console.log('Stream uruchomiony pomyślnie:', response);
      },
      error: (error) => {
        console.error('Błąd uruchamiania streamu:', error);
      }
    });

    const canvas = document.getElementById('video-canvas') as HTMLCanvasElement;

    this.webSocket = 'ws://localhost:3333';
    this.player = new JSMpeg.Player(this.webSocket, { canvas: canvas });
  }

  stopStream(){
    if (this.selectedCamera){
      this.streamService.stopStream(this.selectedCamera.rtspUrl).subscribe({
        next: (response) => {
          console.log('Stream zatrzymany pomyślnie:', response);
        },
        error: (error) => {
          console.error('Błąd podczas zatrzymywania streamu:', error);
        }
      });
    }
  }

  onCameraClick(camera: BuildingDevice): void {
    this.stopStream();
    if (this.player){
      this.player.stop();
    }

    this.selectedCamera = camera;
    this.initializeJSMpeg();
  }
}
