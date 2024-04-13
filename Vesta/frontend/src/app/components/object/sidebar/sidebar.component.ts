import { Component, OnInit , HostListener} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  public buildingId: string;
  public basicInformation: string = "Dane postawowe";
  public buildingPlan: string = "Plany";
  public video: string = "Wideo";
  public services: string = "Serwisy";
  public devices: string = "Urządzenia";
  public persons: string = "Osoby uprawnione";

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustTextBasedOnWidth();
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.buildingId = this.route.snapshot.params['id'];
    this.adjustTextBasedOnWidth();
  }

  private adjustTextBasedOnWidth() {
    const screenWidth = window.innerWidth;

    if (screenWidth < 700) {
      this.basicInformation = "";
      this.buildingPlan = "";
      this.video = "";
      this.services = "";
      this.devices = "";
      this.persons = "";
    } else {
      this.basicInformation = "Dane postawowe";
      this.buildingPlan = "Plan budynku";
      this.video = "Wideo";
      this.services = "Serwisy";
      this.devices = "Kamery";
      this.persons = "Osoby uprawnione";
    }
  }

}
