import { Component } from '@angular/core';
import { Parcel } from '../models/bussines/parcel.model';
import { Feature } from 'ol';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';
import { UtilsService } from '../services/core/utils.service';
import { ParcelsService } from '../services/bussines/parcels.service';
import { MapService } from '../services/map/map.service';

@Component({
  selector: 'app-parcels',
  imports: [TableModule, ScrollPanelModule, CommonModule, ButtonModule],
  templateUrl: './parcels.component.html',
  styleUrl: './parcels.component.css'
})
export class ParcelsComponent {

  parcels: Parcel[] = [];
  cols: any[] = [];

  constructor(
    private parcelsService: ParcelsService,
    private mapService: MapService,
    private utilsService: UtilsService
  ) {
    
  }

  ngOnInit() {
    this.cols = [
      { field: 'name', header: 'Nombre' },
      { field: 'title', header: 'Título' }
    ];
    this.parcels = this.parcelsService.demoParcels;
  }

  onRowSelect(event: any) {
    this.mapService.zoomFeature(event.feature);
  }
}
