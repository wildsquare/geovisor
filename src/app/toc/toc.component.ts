import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayersService } from '../services/map/layers.service';
import { MapService } from '../services/map/map.service';
import Layer from 'ol/layer/Layer';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { SidebarModule } from 'primeng/sidebar';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ComponentsService } from '../services/core/components.service';
import { CatalogComponent } from './catalog.component';

@Component({
    selector: 'app-toc',
    standalone: true,
    templateUrl: './toc.component.html',
    imports: [
        ScrollPanelModule, TableModule, CommonModule, CheckboxModule,
        SliderModule, FormsModule, SidebarModule, ButtonModule
    ]
})
export class TocComponent implements OnInit {

    @ViewChild ('tbllayers', {static: true}) tbllayers: any;
    @ViewChild ('divLegend', {static: true}) divLegend: any;
    @ViewChild ('lblLeyenda', {static: true}) lblLeyenda: any;

    displayLegend!: boolean;
    selectedLayer: any;
    resolution!: number;

    colsLayer!: any[];
    visibility!: any[];
    arrLayers!: any[];
    totalRecords!: number;
    lyrSelected!: string[];
    opacity!: 100;

    actionAddLyrToMap: Subscription = new Subscription();
    actionGetMapResolution: Subscription = new Subscription();

    constructor(
        private layersService: LayersService,
        private mapService: MapService,
        private componentsService: ComponentsService
    ) {  }

    ngOnInit() {
        const self = this;
        this.colsLayer = [
            {label: 'Capa'}
        ];

        this.updateTocLayers();

        this.actionGetMapResolution = this.mapService.getMapResolution$.subscribe(
            (resolution: number) => {
                self.resolution = resolution;
                self.getEnabledLayers();
            }
        );

        this.mapService.fitRefresh();

        this.actionAddLyrToMap = this.layersService.addLayerToMap$.subscribe(
        () => {
            self.updateTocLayers();
        });
    
    }

    getEnabledLayers() {
        const lyrEnb =
      this.layersService.map.getLayers().getArray().filter(
          (lyr: any) => lyr.getProperties().layerProperties.visibleToc === true && lyr.getMaxResolution() !== Infinity
      );
        lyrEnb.map((lyr: any) => {
            if (this.resolution > lyr.getMaxResolution()) {
                lyr.getProperties().layerProperties.disabled = true;
            } else {
                lyr.getProperties().layerProperties.disabled = false;
            }
        });
    }

    updateTocLayers() {
        this.visibility = new Array<any>();
        this.lyrSelected = new Array<string>();
        this.arrLayers = new Array<any>();
        if (this.mapService?.map) {
            const auxArray = this.mapService.map.getLayers().getArray();
            // const auxArray: Layer[] = this.tocLayerService.map.getLayers().getArray().sort((a: Layer, b: Layer) => a.getZIndex() - b.getZIndex());
            auxArray.map((lyr: any) => {
                if (lyr.getProperties().layerProperties.visibleToc === true) {
                    lyr.getProperties().layerProperties.first = false;
                    lyr.getProperties().layerProperties.last = false;
                    this.arrLayers.push(lyr);
                }
                if (lyr.getProperties().layerProperties.visible === true) {
                    this.lyrSelected.push(lyr.getProperties().layerProperties.title);
                }
            });

            this.totalRecords = this.arrLayers.length;
            this.arrLayers[0].getProperties().layerProperties.first = true;
            this.arrLayers[this.totalRecords - 1].getProperties().layerProperties.last = true;
        }
    }

    handleChangeSlide(capa: any) {
        this.layersService.setOpacityLayer(capa.getProperties().layerProperties.name, capa.getProperties().layerProperties.opacity);
    }


    handleChangeChk(capa: Layer) {
        // capa.getProperties().layerProperties.visible = event.target.checked;
        this.layersService.setVisibilityLayer(capa.getProperties()['layerProperties'].name);
        // this.tocMapService.fitRefresh();
    }

    onReorder() {
        for (let i = 0; i < this.arrLayers.length; i++) {
            this.arrLayers[i].zIndex = i;
            this.arrLayers[i].getProperties()['layerProperties'].first = false;
            this.arrLayers[i].getProperties()['layerProperties'].last = false;
        }
        this.totalRecords = this.arrLayers.length;
        this.arrLayers[0].getProperties()['layerProperties'].first = true;
        this.arrLayers[this.totalRecords - 1].getProperties()['layerProperties'].last = true;
        this.mapService.fitRefresh();
    }

    onRowSelect(event: { data: Layer }) {
        this.arrLayers.map((lyr: Layer) => {
            lyr.getProperties()['layerProperties'].infoFeature = false;
        });
        event.data.getProperties()['layerProperties'].infoFeature = true;
    }

    onRowUnselect(event: { data: Layer }) {
        event.data.getProperties()['layerProperties'].infoFeature = false;
    }

    onClickUp(data: Layer) {
        const lyrMinus: Layer | undefined = this.arrLayers.find((lyr: Layer) => lyr.get('zIndex') === data.get('zIndex') - 1);
        if (lyrMinus) {
            data.set('zIndex', data.get('zIndex') - 1);
            lyrMinus.set('zIndex', lyrMinus.get('zIndex') + 1);
            this.arrLayers = this.arrLayers.sort((a: Layer, b: Layer) => a.get('zIndex') - b.get('zIndex'));
            this.onReorder();
        }
    }

    onClickDown(data: Layer) {
        const lyrPlus: Layer | undefined = this.arrLayers.find((lyr: Layer) => lyr.get('zIndex') === data.get('zIndex') + 1);
        if (lyrPlus) {
            data.set('zIndex', data.get('zIndex') + 1);
            lyrPlus.set('zIndex', lyrPlus.get('zIndex') - 1);
            this.arrLayers = this.arrLayers.sort((a: Layer, b: Layer) => a.get('zIndex') - b.get('zIndex'));
            this.onReorder();
        }
    }

    onClickLegend(rowData: Layer) {

        if (rowData.getProperties()['layerProperties'].legend.length > 1) {
            this.lblLeyenda.nativeElement.innerText = 'Leyendas de ' + rowData.getProperties()['layerProperties'].title;
        } else {
            this.lblLeyenda.nativeElement.innerText = 'Leyenda de ' + rowData.getProperties()['layerProperties'].title ;
        }

        if (this.divLegend.nativeElement.hasChildNodes()) {
            Array.from(this.divLegend.nativeElement.childNodes).map((node) => {
                this.divLegend.nativeElement.removeChild(node);
            });
        }
        rowData.getProperties()['layerProperties'].legend.map((legend: string) => {
            const elem: HTMLImageElement = document.createElement('img');
            elem.setAttribute('src', legend);
            elem.setAttribute('style', 'max-width: -webkit-fill-available; margin-top: 10px; margin-left: 15px;');
            this.divLegend.nativeElement.appendChild(elem);
        });

        this.displayLegend = true;
    }

    onClickMetadata(rowData: Layer) {
        rowData.getProperties()['layerProperties'].metadata.map((metadata: string) => {
            window.open(metadata);
        });
    }
    

    removeTocOverlay() {
        this.actionGetMapResolution.unsubscribe();
    }

  }
