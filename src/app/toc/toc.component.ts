import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { OverlayService } from '../services/core/overlay.service';
import { Subscription } from 'rxjs';
import { LayersService } from '../services/map/layers.service';
import { MapService } from '../services/map/map.service';
import { ComponentsService } from '../services/core/components.service';
import { CatalogComponent } from './catalog.component';
import { UtilsService } from '../services/core/utils.service';
import Layer from 'ol/layer/Layer';

@Component({
    selector: 'app-toc',
    templateUrl: './toc.component.html',
    styleUrls: ['./toc.component.css']
})
export class TocComponent implements OnInit {

    @ViewChild ('tbllayers', {static: true}) tbllayers;
    @ViewChild ('cmpCatalog', {static: true}) cmpCatalog;
    @ViewChild ('divLegend', {static: true}) divLegend;
    @ViewChild ('lblLeyenda', {static: true}) lblLeyenda;
    @Output() public closeToc = new EventEmitter();

    displayCatalog;
    displayLegend;
    selectedLayer: any;
    resolution;

    colsLayer: any[];
    visibility: any[];
    arrLayers: any[];
    totalRecords: number;
    lyrSelected: string[];
    opacity: 100;

    actionAddLyrToMap: Subscription = null;
    actionGetMapResolution: Subscription = null;

    tocMapService: any;
    tocLayerService: any;

    constructor(
        private layersService: LayersService,
        private mapService: MapService,
        private overlayService: OverlayService,
        private componentsService: ComponentsService,
        private utilsService: UtilsService
    ) { }

    ngOnInit() {
        const self = this;
        this.colsLayer = [
            {label: 'Capa'}
        ];
        this.tocMapService = this.mapService;
        this.tocLayerService = this.layersService;

        this.updateTocLayers();

        this.actionGetMapResolution = this.tocMapService.getMapResolution$.subscribe(
            (resolution: number) => {
                self.resolution = resolution;
                self.getEnabledLayers();
            }
        );

        this.tocMapService.fitRefresh();

        this.actionAddLyrToMap = this.tocLayerService.addLayerToMap$.subscribe(
            () => {
                self.updateTocLayers();
            });
    }

    getEnabledLayers() {
        const lyrEnb =
      this.tocLayerService.map.getLayers().getArray().filter(
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
        const auxArray = this.tocLayerService.map.getLayers().getArray().sort((a, b) => a.getZIndex() - b.getZIndex());
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

    setCatalogComponent() {
        this.componentsService.removeComponents(this.componentsService.tocContainer);
        this.componentsService.addComponent(this.componentsService.tocContainer, CatalogComponent);
    }

    hanleChangeSlide(capa, event) {
        this.tocLayerService.setOpacityLayer(capa, event.value);
    }


    handleChangeChk(capa) {
    // capa.getProperties().layerProperties.visible = event.target.checked;
        this.tocLayerService.setVisibilityLayer(capa.getProperties().layerProperties.name);
    // this.tocMapService.fitRefresh();
    }

    onReorder() {
        for (let i = 0; i < this.arrLayers.length; i++) {
            this.arrLayers[i].zIndex = i;
            this.arrLayers[i].getProperties().layerProperties.first = false;
            this.arrLayers[i].getProperties().layerProperties.last = false;
        }
        this.totalRecords = this.arrLayers.length;
        this.arrLayers[0].getProperties().layerProperties.first = true;
        this.arrLayers[this.totalRecords - 1].getProperties().layerProperties.last = true;
        this.tocMapService.fitRefresh();
    }

    onRowSelect(event) {
        this.arrLayers.map((lyr) => {
            lyr.getProperties().layerProperties.infoFeature = false;
        });
        event.data.getProperties().layerProperties.infoFeature = true;
    }

    onRowUnselect(event) {
        event.data.getProperties().layerProperties.infoFeature = false;
    }

    onClickUp(data) {
        const lyrMinus = this.arrLayers.find((lyr) => lyr.values_.zIndex === data.values_.zIndex - 1);
        data.values_.zIndex = data.values_.zIndex - 1;
        lyrMinus.values_.zIndex = lyrMinus.values_.zIndex + 1;
        this.arrLayers = this.arrLayers.sort((a, b) => a.values_.zIndex - b.values_.zIndex);
        this.onReorder();
    }

    onClickDown(data) {
        const lyrPlus = this.arrLayers.find((lyr) => lyr.values_.zIndex === data.values_.zIndex + 1);
        data.values_.zIndex = data.values_.zIndex + 1;
        lyrPlus.values_.zIndex = lyrPlus.values_.zIndex - 1;
        this.arrLayers = this.arrLayers.sort((a, b) => a.values_.zIndex - b.values_.zIndex);
        this.onReorder();
    }

    onClickLegend(rowData: Layer) {

        if (rowData.getProperties().layerProperties.legend.length > 1) {
            this.lblLeyenda.nativeElement.innerText = 'Leyendas de ' + rowData.getProperties().layerProperties.title;
        } else {
            this.lblLeyenda.nativeElement.innerText = 'Leyenda de ' + rowData.getProperties().layerProperties.title ;
        }

        if (this.divLegend.nativeElement.hasChildNodes()) {
            Array.from(this.divLegend.nativeElement.childNodes).map((node) => {
                this.divLegend.nativeElement.removeChild(node);
            });
        }
        rowData.getProperties().layerProperties.legend.map((legend) => {
            const elem = document.createElement('img');
            elem.setAttribute('src', legend);
            elem.setAttribute('style', 'max-width: -webkit-fill-available; margin-top: 10px; margin-left: 15px;');
            this.divLegend.nativeElement.appendChild(elem);
        });

        this.displayLegend = true;
    }

    onClickMetadata(rowData) {
        rowData.getProperties().layerProperties.metadata.map((metadata) => {
            window.open(metadata);
        });
    }

    handleClick() {
        this.closeToc.emit();
    }

    onHide() {
        this.cmpCatalog.addLayersFromCatalog(true);
        /*this.lyrService.arrSelectedCatalog.map((catalog) => {
      this.lyrService.addLayerFromCatalog(catalog);
    });*/
        this.updateTocLayers();
    }

    removeTocOverlay() {
        this.overlayService.hideOverlayTocRef();
        this.actionGetMapResolution.unsubscribe();
    }
  }
