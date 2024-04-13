import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { BuildingPlan } from 'src/app/shared/models/buildingPlan.model';
import { Lightbox } from 'ngx-lightbox';
import { RoleService } from 'src/app/shared/services/role.service';
import { BuildingService } from 'src/app/shared/services/building.service';
import { ActivatedRoute } from '@angular/router';
import { Building } from 'src/app/shared/models/building.model';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts"
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-object-plan-card',
  templateUrl: './object-plan-card.component.html',
  styleUrls: ['./object-plan-card.component.css']
})
export class ObjectPlanCardComponent implements OnInit {

  @Input() plan: BuildingPlan;
  @Output() deleteRequest = new EventEmitter<string>();
  @Output() editRequest = new EventEmitter<BuildingPlan>();

  buildingId: string;
  buildingData: Building = null;

  constructor(
    public roleService: RoleService,
    private lightbox: Lightbox,
    private route: ActivatedRoute,
    private buildingService: BuildingService,
    ) {}

  ngOnInit() {
    this.buildingId = this.route.snapshot.params['id'];
    this.loadBuildingData();
  }

  deletePlan(value: string) {
    this.deleteRequest.emit(value);
  }

  editPlan(plan: BuildingPlan) {
    this.editRequest.emit(plan);
  }

  open(imageSrc: string): void {
    const lightboxImage = {
      src: imageSrc,
      caption: '',
      thumb: imageSrc
    };

    this.lightbox.open([lightboxImage], 0);
  }

  getBase64ImageFromURL(url: string) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }

  async saveToPdf(){
    const base64Image  = await this.getBase64ImageFromURL(this.plan.imageUrl) as string;

    let docDefinition: TDocumentDefinitions = {
      content: [
        {
          text: [
            { text: `${this.buildingData.synonym}, ${this.buildingData.name} ul.${this.buildingData.street} ${this.buildingData.number}, ${this.buildingData.zipCode} ${this.buildingData.city}` }
          ],
          style: 'header'
        },
        { image: base64Image, width: 500},
        { text: `Opis: ${this.plan.description}`, style: 'subheader' },
      ],
      styles: {
        header: {
          fontSize: 15,
          color: '#2176ff',
          alignment: 'center',
          margin: [10, 0, 0, 10]
        },
        subheader: {
          alignment: 'center',
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 5]
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
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

  close(): void {
    this.lightbox.close();
  }
}
