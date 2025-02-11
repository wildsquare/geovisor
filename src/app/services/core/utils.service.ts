import { Injectable } from '@angular/core';
import OlWKT from 'ol/format/WKT';
import OlGeoJson from 'ol/format/GeoJSON';
import OlGML3 from 'ol/format/GML3';
import { Feature, Feature as OlFeature } from 'ol';
import { Geometry as OlGeometry, Polygon } from 'ol/geom';
import { extend as OlExtend } from 'ol/extent';
import * as OlProj from 'ol/proj';
import * as OlProj4 from 'ol/proj/proj4';
import proj4 from 'proj4';
// import { AppConfigService } from '../config/app.config.service';
import { Subject } from 'rxjs';
import { Point } from 'ol/geom';
import { LayerProperties } from '../../models/pojo/layerProperties.model';

if (proj4) {
    proj4.defs('EPSG:3857',
        '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');
    proj4.defs('EPSG:4258', '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs');
    proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
    proj4.defs('EPSG:25829', '+proj=utm +zone=29 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    proj4.defs('EPSG:25830', '+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    proj4.defs('EPSG:25831', '+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    proj4.defs('EPSG:32628', '+proj=utm +zone=28 +datum=WGS84 +units=m +no_defs');
    proj4.defs('EPSG:32629', '+proj=utm +zone=29 +datum=WGS84 +units=m +no_defs');
    proj4.defs('EPSG:32630', '+proj=utm +zone=30 +datum=WGS84 +units=m +no_defs');
    proj4.defs('EPSG:32631', '+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs');
}
OlProj4.register(proj4);

@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    appName!: string;
    wktFormat!: OlWKT;
    gmlFormat!: OlGML3;
    geojsonFormat!: OlGeoJson;
    proj = OlProj;

    /** En local sin servidor */
    epsg = 'EPSG:3857';
    center = [-792499.16, 4467958.24];
    zoom = 5.7;

    centerEmergency = [-1792499.16, 4467958.24];

    setImageFeatureEvent = new Subject<any>();
    public setImageFeatureEvent$ = this.setImageFeatureEvent.asObservable();
    getImageFeatureEvent = new Subject<any>();
    public getImageFeatureEvent$ = this.getImageFeatureEvent.asObservable();
    setImageLayerEvent = new Subject<any>();
    public setImageLayerEvent$ = this.setImageLayerEvent.asObservable();
    getImageLayerEvent = new Subject<any>();
    public getImageLayerEvent$ = this.getImageLayerEvent.asObservable();

    finishLoadingPanel = new Subject<any>();
    public finishLoadingPanel$ = this.finishLoadingPanel.asObservable();
    startLoadingPanel = new Subject<string>();
    public startLoadingPanel$ = this.startLoadingPanel.asObservable();

    urlServicesConflicts!: string;
    urlServicesDistrict!: string;
    urlServicesRegistry!: string;
    urlServicesCadastre!: string;
    urlServicesEmergency!: string;
    urlServicesRcentral!: string;
    urlServicesPwvg!: string;
    urlServicesUtils!: string;
    urlServicesBase!: string;
    urlServicesGdatacore!: string;

    constructor() {
    }

    groupBy<T, K>(list: T[], keyGetter: (item: T) => K): Map<K, T[]> {
        const map = new Map<K, T[]>();
        list.forEach((item: T) => {
            const key = keyGetter(item);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            } else {
                collection.push(item);
            }
        });
        return map;
    }

    transformCoordOlFeature(inEpsg: string, outEpsg: string, feature: OlFeature): OlFeature {
        const geom = feature.getGeometry();
        if (geom) {
            const inProj = this.proj.get(inEpsg);
            const outProj = this.proj.get(outEpsg);
            if (inProj && outProj) {
                feature.setGeometry(geom.transform(inProj, outProj));
            }
        }
        return feature;
    }

    transformCoordWktFeature(inEpsg: string, wkt: string): string {
        const geo = this.getFeatureFromWkt(wkt, inEpsg);
        return this.getWktFromFeature(geo);
    }

    transformCoord(inEpsg: string, outEpsg: string, lon: number, lat: number): number[] {
        let numArr = new Array<number>();
        const geom = new Point([lon, lat]);

        geom.transform(inEpsg, outEpsg);
        numArr = geom.getFirstCoordinate();

        return numArr;
    }

    saveBlob(blob: Blob, filename: string): any {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        return a;
    }

    saveXmlFile(filename: string, data: any) {
        this.saveBlob(new Blob([data], { type: 'text/xml' }), filename);
    }

    savePdfFile(filename: string, blob: any) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        return a;
    }

    /* saveGmlFile(olFeature: OlFeature) {
    this.gmlFormat = new OlGML3();
    const features = new Array<OlFeature>();
    features.push(olFeature);
    const gml = this.gmlFormat.writeFeatures(
      features, {dataProjection: 'EPSG:25830', featureProjection: 'EPSG:25830', rightHanded: true, decimals: 4}
    );
    this.saveXmlFile(olFeature.id + '.gml', gml);
  }*/

    saveImageBlob(data: any): Blob {
        return new Blob([data], { type: 'image/png' });
    }

    save_image_file(bytes: string): string {
        const bytesImage = atob(bytes);
        const arrayImage = new Uint8Array(bytesImage.length);
        for (let i = 0; i < bytesImage.length; i++) {
            arrayImage[i] = bytesImage.charCodeAt(i);
        }
        const blob = new Blob([arrayImage], { type: 'image/png' });

        return window.URL.createObjectURL(blob);
    }

    getXmlFile(data: any): Blob {
        return new Blob([data], { type: 'text/xml' });
    }

    getFeatureFromWkt(geom: string, srs: string): OlFeature {
        this.wktFormat = new OlWKT();
        const auxFeature = this.wktFormat.readFeature(geom, {
            dataProjection: srs,
            featureProjection: srs
        });

        if (srs !== this.epsg) {
            if ((this.epsg === 'EPSG:3857') && (srs.includes('EPSG:258'))) {
                const geometry = auxFeature.getGeometry();
                if (geometry) {
                    let auxFeature2 = geometry.transform(srs, 'EPSG:4258');
                    auxFeature2 = auxFeature2.transform('EPSG:4258', this.epsg);
                    auxFeature.setGeometry(auxFeature2);
                }
            } else {
                const geometry = auxFeature.getGeometry();
                if (geometry) {
                    const auxFeature2 = geometry.transform(srs, this.epsg);
                    auxFeature.setGeometry(auxFeature2);
                }
            }
        }
        return auxFeature;
    }

    getWktFromFeature(feat: OlFeature): string {
        this.wktFormat = new OlWKT();
        const auxFeature = this.wktFormat.writeFeature(feat);
        return auxFeature;
    }

    getGeometryFromGeojson(geojson: string, epsg: string) {
        this.geojsonFormat = new OlGeoJson();
        let geom = this.geojsonFormat.readGeometry(geojson, {
            featureProjection: epsg,
        });
        if (epsg !== this.epsg) {
            geom = geom.transform(epsg, this.epsg);
        }
        return geom;
    }

    getGeometryFromWKT(geojson: string, epsg: string) {
        this.wktFormat = new OlWKT();
        let geom = this.wktFormat.readGeometry(geojson, {
            featureProjection: epsg,
        });
        if (epsg !== this.epsg) {
            geom = geom.transform(epsg, this.epsg);
        }
        return geom;
    }

    getGeometryFromEWKT(ewkt: string) {
        this.wktFormat = new OlWKT();
        const epsg = this.getEpsgFromEwkt(ewkt);
        let geom = this.wktFormat.readGeometry(this.getWktFromEwkt(ewkt), {
            featureProjection: epsg,
        });
        if (epsg !== this.epsg) {
            geom = geom.transform(epsg, this.epsg);
        }
        return geom;
    }

    getAreaFromSrsCatastro(wkt: string, srsCatastro: string, srsOrigin: string): number {
        this.wktFormat = new OlWKT();
        let geom = this.wktFormat.readGeometry(wkt, {
            featureProjection: srsOrigin,
        });
        if (srsCatastro !== srsOrigin) {
            geom = geom.transform(srsOrigin, srsCatastro);
        }
        return (geom as Polygon).getArea();
    }

    getAreaFromEwkt(ewkt: string): number {
        this.wktFormat = new OlWKT();
        const geom = this.wktFormat.readGeometry(this.getWktFromEwkt(ewkt), {
            featureProjection: this.getEpsgFromEwkt(ewkt),
        });
        return (geom as Polygon).getArea();
    }

    getWktTransformFromWkt(wkt: string, srsDestination: string, srsOrigin: string) {
        this.wktFormat = new OlWKT();
        let geom = this.wktFormat.readGeometry(wkt, {
            featureProjection: srsOrigin,
        });
        geom = geom.transform(srsOrigin, srsDestination);
        return this.wktFormat.writeGeometry(geom);
    }

    createGeomPoint(lon: number, lat: number): Point {
        return new Point([lon, lat]);
    }

    // Función que obtiene un array de coordenadas (polygon) a partir de texto plano
    getPolygons(coords: string): Array<string> {
        const arrReturn = new Array<string>();
        let aux = coords.split(/"/);
        if (aux.length === 1) { aux = coords.split(/'/); } // <-- Por si se usan comillas simples para los poligonos

        // Por si tampoco se usan comillas dobles entre poligonos
        if (aux.length === 1) {
            // Hay casos que el siguiente split no sirve. Ej.: 123,45 67,9...
            const aux2 = coords.split(/,/);
            if (aux2.length > 1 && !aux2[1].includes(' ')) {
                aux = aux2;
            }
        }

        aux = aux.filter(c => c !== '' && c.trim() !== ',');
        aux.map(poly => {
            arrReturn.push(poly.trim()); // <-- Eliminamos posibles espacios en blanco al principio y fin de cada poligono
        });
        return arrReturn;
    }

    setImageFeature(feature: OlFeature, size: number) {
        this.setImageFeatureEvent.next([feature, size]);
    }

    setImageLayer(layer: OlFeature, size: number): void {
        this.setImageLayerEvent.next([layer, size]);
    }

    getImageFeature(img: any): void {
        this.getImageFeatureEvent.next(img);
    }

    getImageLayer(img: any): void {
        this.getImageLayerEvent.next(img);
    }

    /**
     * Returns a random integer between an interval.
     *
     * @param i_min Minimum value of the interval.
     * @param i_max Maximum value of the interval.
     *
     * @returns a random integer between an interval
     */
    getRandomInt(iMin: number, iMax: number): number {
        return Math.floor(Math.random() * (iMax - iMin)) + iMin;
    }

    /**
     * Gets the SRID of the EPSG.
     *
     * @param epsg EPSG code.
     *
     * @returns the SRID of the EPSG.
     */
    getSRIDFromEPSG(epsg: string): string {
        return epsg.replace('EPSG:', '');
    }

    /**
     * Gets the EPSG of the SRID.
     *
     * @param srid SRID code as a number.
     *
     * @returns the EPSG of the SRID.
     */
    getEPSGFromSRID(srid: number): string {
        return `EPSG:${srid}`;
    }


    getEwktFromWkt(wkt: string, srid: string): string {
        return `SRID=${this.getSRIDFromEPSG(srid)};${wkt}`;
    }


    /**
     * Gets the EWKT of a feature.
     *
     * @param geoentity Feature structure.
     *
     * @returns the EWKT of a feature.
     */
    getEwktFromGeoentity(geoentity: any): string {
        return `SRID=${this.getSRIDFromEPSG(geoentity.srid)};${geoentity.geometry}`;
    }

    /**
     * Gets the EWKT of a OlFeature.
     *
     * @param feature Feature structure.
     *
     * @returns the EWKT of a feature.
     */
    getEwktFromOlFeature(feature: OlFeature): string {
        this.wktFormat = new OlWKT();
        const geometry = feature.getGeometry();
        if (!geometry) {
            throw new Error('Feature geometry is undefined');
        }
        const wktGeometry = this.wktFormat.writeGeometry(geometry);
        return `SRID=${this.epsg.split(':')[1]};${wktGeometry}`;
    }

    getWktFromEwkt(ewkt: string) {
        return ewkt.split(';')[1];
    }

    getEpsgFromEwkt(ewkt: string) {
        let epsg = ewkt.split(';')[0];
        epsg = 'EPSG:' + epsg.split('=')[1];
        return epsg;
    }

    getCenterFromOlFeature(feature: OlFeature): [number, number] {
            const geometry = feature.getGeometry();
            if (!geometry) {
                throw new Error('Feature geometry is undefined');
            }
            return this.getCenterFromOlGeometry(geometry);
        }

    getCenterFromOlGeometry(geometry: OlGeometry): [number, number] {
        const ext = geometry.getExtent();
        return [(ext[0] + ext[2]) / 2, (ext[1] + ext[3]) / 2];
    }

    /**
     * Obtain a formated area.
     * @param area area to format.
     * @param units area units.
     * @returns string of formated area.
     */
    getFormatedArea(area: number, units: string = ''): string {
        let areaResult = new Intl.NumberFormat('es-ES').format(area).toString();
        switch (units) {
        case 'm2':
            areaResult = areaResult + ' m\xB2';
            break;
        case 'km2':
            areaResult = areaResult + ' km\xB2';
            break;
        default:
            if (units) { areaResult = areaResult + ' ' + units; }
        }
        return areaResult;
    }

    /**
     * Convert WKT to coordinates string.
     * @param wktCoords coordinates in WKT.
     * @returns coordinates string.
     */
    multiPolygonParse(wktCoords: string): string {
        let coords = wktCoords.replace(/MULTIPOLYGON/i, '');
        coords = coords.replace(/POLYGON/i, '');
        coords = coords.trim();
        coords = coords.substring(1, coords.length - 1);
        const arrPolygons = coords.split('),');
        coords = '"' + arrPolygons[0].replace(/\u002c/g, ' ').replace(/\u0028/g, '').replace(/\u0029/g, '') + '"';
        for (let i = 1; i < arrPolygons.length; i++) {
            coords = coords + '"' + arrPolygons[i].replace(/\u0028/g, '').replace(/\u0029/g, '') + '"';
        }
        return coords;
    }


    // Validar y limpiar el nombre base eliminando el último punto y el texto posterior, si lo tiene
    generateCloneName(parentId: string, label: string, ringType: number, index: number = 1, addSuffix: boolean = true,  addPrefix: boolean = true): string {
        const baseCardName = `${addPrefix ? 'clon_' : ''}${parentId.split('.').pop() || parentId}`;

        if (!addSuffix) {
            return baseCardName; // Devuelve solo el nombre base si no se quiere el sufijo
        }

        const originalNumberMatch = label.match(/(\d+)$/);
        const specificNumber = originalNumberMatch ? originalNumberMatch[0] : null;

        const isHole = ringType === 1;
        const suffix = isHole
            ? `_H${specificNumber || index}`
            : `_S${specificNumber || index}`;

        return `${baseCardName}${suffix}`;
    }

    // Validar y limpiar el nombre base eliminando el último punto y el texto posterior, si lo tiene
    generateCloneNameHolesOverlaps(parentId: string, label: string, ringType: number, index: number = 1, addSuffix: boolean = true,  addPrefix: boolean = true, quitDot: boolean = true): string {
        let baseCardName = addPrefix ? 'clon_' : '';

        // Determina el valor base según quitDot
        if (quitDot && parentId.includes('.')) {
            baseCardName += parentId.split('.').slice(0, -1).join('.');
        } else {
            baseCardName += parentId;
        }

        // Si no se requiere sufijo, devuelve el nombre base
        if (!addSuffix) {
            return baseCardName;
        }

        // Extrae el número original del label si existe
        const originalNumberMatch = label.match(/(\d+)$/);
        const specificNumber = originalNumberMatch ? originalNumberMatch[0] : null;

        // Determina el sufijo según el tipo de anillo (hole o surface)
        const isHole = ringType === 1;
        const suffix = isHole
            ? `_H${specificNumber || index}`
            : `_O${specificNumber || index}`;

        // Devuelve el nombre completo con sufijo
        return `${baseCardName}${suffix}`;
    }

    centerToExtentFeatures(features: Feature[], epsg: string): number[] {
        let extZoom: number[] | null = null;
        let geometry = null;
        const center = new Array<number>();
        features.map((feature) => {
            if (feature.getGeometry()) {
                geometry = feature.getGeometry();
            } else {
                geometry = feature.getGeometry();
            }
            if (extZoom) {
                const geometry = feature.getGeometry();
                if (geometry) {
                    extZoom = OlExtend(extZoom, geometry.getExtent());
                }
            } else {
                const geometry = feature.getGeometry();
                if (geometry) {
                    extZoom = geometry.getExtent();
                }
            }
        });
        if (extZoom) {
            center.push(extZoom[0] + (extZoom[2] - extZoom[0]) / 2);
            center.push(extZoom[1] + (extZoom[3] - extZoom[1]) / 2);
        }
        return center;
    }

    setLayerProperties(
        name: string, title: string, type: string, visible: boolean, visibleToc?: boolean,
        queryable?: boolean, info?: boolean, legend?: string[], metadata?: string[]
    ): LayerProperties {
        const propLayer = new LayerProperties();
        propLayer.name = name;
        propLayer.title = title;
        propLayer.type = type;
        propLayer.visible = visible;
        propLayer.opacity = 100;
        if (visibleToc) {
            propLayer.visibleToc = visibleToc;
        } else {
            propLayer.visibleToc = false;
        }
        if (queryable) {
            propLayer.queryable = queryable;
        } else {
            propLayer.queryable = false;
        }
        if (info) {
            propLayer.infoFeature = info;
        } else {
            propLayer.infoFeature = false;
        }
        if (legend) {
            propLayer.legend = legend;
        }
        if (metadata) {
            propLayer.metadata = metadata;
        }
        return propLayer;
    }


}
