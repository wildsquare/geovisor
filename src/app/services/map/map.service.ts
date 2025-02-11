import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import Map from 'ol/Map';
import { Collection, Feature, Feature as OlFeature } from 'ol';
import { Extent, extend as OlExtend } from 'ol/extent';
import { altKeyOnly, click } from 'ol/events/condition';
import { Draw, Modify, Snap, Select, Translate, DoubleClickZoom } from 'ol/interaction';
import { LayersService } from './layers.service';
import { UtilsService } from '../core/utils.service';
import { Point, Polygon } from 'ol/geom';

@Injectable({
    providedIn: 'root'
})
export class MapService {

    selectedType: string;

    typeCadastreFeature!: string;
    errorFeature!: string;

    olFeatureSelect!: OlFeature;

    contNewFeature: number;

    mapResolution!: number;

    select!: Select;
    draw!: Draw;
    snap!: Snap;
    modify!: Modify;
    translate!: Translate;
    deleteVertex!: Modify;


    getArrayFeatures = new Subject();
    public getArrayFeatures$ = this.getArrayFeatures.asObservable();

    getEditFeatures = new Subject();
    public getEditFeatures$ = this.getEditFeatures.asObservable();

    selFeatureEvent = new Subject<any>();
    public selFeatureEvent$ = this.selFeatureEvent.asObservable();

    getMapResolution = new Subject<number>();
    public getMapResolution$ = this.getMapResolution.asObservable();

    actionFeatures: Subscription = new Subscription();
    actionEditFeature: Subscription = new Subscription();
    actionGetArrConflicts: Subscription = new Subscription();
    actionGeoinscriptionFeatures: Subscription = new Subscription();
    actionGeopresentationFeatures: Subscription = new Subscription();
    actionGeoboeFeatures: Subscription = new Subscription();
    actionGetAnalizedFeatures: Subscription = new Subscription();

    map!: Map;

    constructor(
        private layerService: LayersService,
        private utilsService: UtilsService
    ) {

        this.selectedType = 'normal';
        this.contNewFeature = 0;

    }

    setMap(map: Map) {
        this.map = map;
    }


    deleteFeatures() {
        this.layerService.vSourceDraw.getFeatures().map((feature: OlFeature) => {
            this.layerService.vSourceDraw.removeFeature(feature);
        });
    }

    drawAdminArea(area: any) {
        let srid = '';
        if (area.srid) {
            srid = area.srid;
        }

        if (area.srs) {
            srid = area.srs;
        }
        const geom = this.utilsService.getGeometryFromWKT(area.geom, srid);
        const featArea = new OlFeature({
            geometry: geom
        });
        this.layerService.vSourceSearch.clear();
        this.layerService.vSourceSearch.addFeature(featArea);
        if (this.layerService.getLayerBy(this.map, 'name', 'lyrSearch') === null) {
            this.map.addLayer(this.layerService.vLayerSearch);
        }

        let extZoom = null;
        if (geom.getType() === 'GeometryCollection') {
            extZoom = geom.getExtent();
        } else {
            extZoom = geom.getExtent();
        }

        this.map.getView().fit(
            extZoom as Extent,
            {
                size: this.map.getSize(),
                padding: [200, 100, 100, 300],
                nearest: false
            }
        );
    }

    cleanSearchArea() {
        this.layerService.vSourceSearch.clear();
    }


    cleanConflictRegistry() {
        this.layerService.vSourceConflicts.clear();
    }

    cleanEditLayer() {
        this.layerService.vSourceEdit.getFeatures().map((feature: OlFeature) => {
            this.layerService.vSourceEdit.removeFeature(feature);
        });
    }

    clearLyr(layerName: string): void {
        const layer = this.layerService.getLayerBy(this.map, 'name', layerName);
        if (layer) {
            layer.getSource().clear();
            layer.getSource().refresh();
        }
    }

    addMarker(lon: number, lat: number, type: string, clean: boolean): void {
        if (clean === true) {
            this.layerService.vSourceMarkers.clear();
        }
        const iconFeature = new OlFeature({
            geometry: this.utilsService.createGeomPoint(lon, lat),
            type
        });
        this.layerService.vSourceMarkers.addFeature(iconFeature);
    }

    getFeatureToAdvanceEdit(editfeature: OlFeature) {
        this.cleanEditLayer();
        this.layerService.vSourceEdit.addFeature(editfeature);
    }

    setTranslateInteraction(features: OlFeature, type: string) {
        this.select = new Select({features: new Collection([features])});
        this.map.addInteraction(this.select);
        this.translate = new Translate({features: this.select.getFeatures()});
        this.map.addInteraction(this.translate);
        if (type !== 'registry') {
            this.map.removeInteraction(this.select);
        }
    }

    removeInteractions() {
        this.typeCadastreFeature = '';
        this.map.removeInteraction(this.draw);
        this.map.removeInteraction(this.snap);
        this.map.removeInteraction(this.modify);
        this.map.removeInteraction(this.translate);
        this.map.removeInteraction(this.deleteVertex);
    // this.map.removeInteraction(this.select);
    }


    /** Zooms de Mapa */
    zoomToPoint(point: [number, number], zoom: number): void {
        this.map.getView().setCenter(point);
        this.map.getView().setZoom(zoom);
    }

    zoomToExtentLayer(layerName: string, padding: [number, number, number, number]): void {
        const layer = this.layerService.getLayerBy(this.map, 'name', layerName);
        this.map.getView().fit(
            layer.getSource().getExtent(),
            {
                size: this.map.getSize(),
                padding,
                nearest: false
            }
        );
    }

    zoomExtent(extZoom: any): void {
        const self = this;
        this.map.getView().fit(
            extZoom as Extent,
            {
                size: self.map.getSize(),
                padding: [200, 100, 100, 300],
                nearest: false
            }
        );
    }

    zoomFeature(feature: Feature) {
        const geometry = feature.getGeometry();
        let extZoom;
        if (geometry) { 
            if (geometry.getType() === 'GeometryCollection') {
                extZoom = geometry.getExtent();
            } else {
                extZoom = geometry;
            }
            this.map.getView().fit(
                extZoom as Extent,
                {
                    size: this.map.getSize(),
                    padding: [50, 50, 50, 50],
                    nearest: false
                }
            );
        }
    }

    fitRefresh() {
        this.map.getView().fit(
            this.map.getView().calculateExtent(this.map.getSize()),
            {
                size: this.map.getSize(),
                padding: [0, 0, 0, 0],
                nearest: false
            }
        );
    }

}
