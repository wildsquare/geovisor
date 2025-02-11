import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { LayersService } from '../services/map/layers.service';
import { UtilsService } from '../services/core/utils.service';
import { MapService } from '../services/map/map.service';
import { OverlayService } from '../services/core/overlay.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {

  map: Map;
  view: View;

  tocVisible = false;
  
  dockItems:  any[];

  constructor(
    private layerServices: LayersService,
    private mapServices: MapService,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {

    this.dockItems = [
        {
            label: 'Menú principal',
            icon: 'pi pi-bars',
            command: () => {
                this.showOverlay(1);
            }
        },
        {
            label: 'Menu Fichas',
            icon: 'pi pi-th-large',
            command: () => {
                this.showOverlay(2);
            }
        },
        {
            label: 'Ajustes de capas',
            icon: 'i i-join-2',
            command: () => {
                this.showOverlay(3);
            }
        }
    ];
    this.view = new View({
        center: this.utilsService.center,
        projection: this.utilsService.epsg,
        zoom: this.utilsService.zoom,
        maxZoom: 21
    });

    this.map = new Map({
        target: document.getElementById('map'),
        layers: [
          this.layerServices.lyrOSM,
          this.layerServices.lyrPnoaBaseWms,
          this.layerServices.lyrPnoa,
          this.layerServices.lyrCatastro,
          this.layerServices.lyrCatastrosForales
  ],
        view: this.view,
    });
    this.map.removeControl(this.map.getControls()[0]);
    this.layerServices.setMap(this.map);
    this.mapServices.setMap(this.map);
  }

  showOverlay(componentNumber) {
    // this.loadFileRouterService.toComponent = '';
    // this.loadFileRouterService.fromComponent = '';
    // this.loadFilesOverlayService.hideLoadFiles();
    if (componentNumber === 3){
        // layers sidebar right bottom
        this.tocVisible = true;
    }
}

}
