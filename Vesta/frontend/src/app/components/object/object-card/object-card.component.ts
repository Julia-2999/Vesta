import { Component, Input, OnInit } from '@angular/core';
import { Building } from 'src/app/shared/models/building.model';
import { Output, EventEmitter } from '@angular/core';
import { RoleService } from 'src/app/shared/services/role.service';

@Component({
  selector: 'app-object-card',
  templateUrl: './object-card.component.html',
  styleUrls: ['./object-card.component.css']
})


export class ObjectCardComponent  {

  @Input() building: Building;
  @Output() deleteRequest = new EventEmitter<string>();

  constructor(
    public roleService: RoleService
  ) {}

  deleteBuilding(value: string) {
    this.deleteRequest.emit(value);
  }

}

