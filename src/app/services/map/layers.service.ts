import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Feature as OlFeature } from 'ol';
import { WMTS, TileWMS, OSM, XYZ, ImageWMS } from 'ol/source';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import OlTileGrid from 'ol/tilegrid/WMTS';
import * as OlExt from 'ol/extent';
import * as OlProj from 'ol/proj';
import Map from 'ol/Map';
import Style from 'ol/style/Style';
import * as OlProj4 from 'ol/proj/proj4';
import proj4 from 'proj4';
import { Subscription, Subject } from 'rxjs';
import { UtilsService } from '../core/utils.service';
import TileSource from 'ol/source/Tile';
import TileLayer from 'ol/layer/Tile';
import Layer from 'ol/layer/Layer';
import LayerGroup from 'ol/layer/Group';
import ImageLayer from 'ol/layer/Image';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { ServicesCatalog } from '../../models/catalog/servicesCatalog.model';
import { StyleService } from './style.service';

if (proj4) {
    proj4.defs('EPSG:3857',
        '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');
    proj4.defs('EPSG:4258', '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs');
    proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
    proj4.defs('EPSG:25829', '+proj=utm +zone=29 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    proj4.defs('EPSG:25830', '+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    proj4.defs('EPSG:25831', '+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
}
OlProj4.register(proj4);


@Injectable({
    providedIn: 'root'
})
export class LayersService {

    lyrOSM!: TileLayer<TileSource>;
    lyrPnoa!: TileLayer<TileSource>;
    lyrPnoaBase!: TileLayer<TileSource>;
    lyrPnoaWms!: TileLayer<TileWMS>;
    lyrPnoaBaseWms!: TileLayer<TileWMS>;
    lyrCatastro!: ImageLayer<ImageWMS>;
    lyrCatastroNavarra!: ImageLayer<ImageWMS>;
    lyrCatastroAlava!: ImageLayer<ImageWMS>;
    lyrCatastroVizcaya!: ImageLayer<ImageWMS>;
    lyrCatastroGuipuzcoa!: ImageLayer<ImageWMS>;
    lyrMdt!: TileLayer<TileSource>;
    lyrFincas!: TileLayer<TileWMS>;
    lyrCatastrosForales!: LayerGroup;

    map!: Map;

    vSourceDraw: any;
    vLayerDraw: any;

    vSourceSearch: any;
    vLayerSearch: any;

    vSourceEdit: any;
    vLayerEdit: any;

    vSourceMarkers: any;
    vLayerMarkers: any;

    vSourceNeighbours: any;
    vLayerNeighbours!: VectorLayer<any>;

    vSourceCadastre!: VectorSource;
    vLayerCadastre!: VectorLayer<any>;

    vSourceConflicts!: VectorSource;
    vLayerConflicts!: VectorLayer<any>;

    vSourceEmergencyData!: VectorSource;
    vLayerEmergencyData!: VectorLayer<any>;

    arrSelectedCatalog: ServicesCatalog[];

    shadowStyle = Style;
    parcelStyle = Style;
    buildingStyle = Style;

    actionGetSldStyles: Subscription = new Subscription();

    addLayerToMap = new Subject<any>();
    public addLayerToMap$ = this.addLayerToMap.asObservable();

    removeLayerFromMap = new Subject<any>();
    public removeLayerFromMap$ = this.removeLayerFromMap.asObservable();

    lyrZIndex = 0;

    currentLyrName!: string;
    currentFeatureLyrData!: any;

    addFeatureInfoToMap = new Subject<any>();
    public addFeatureInfoToMap$ = this.addFeatureInfoToMap.asObservable();

    getVolcanoInfo = new Subject<any>();
    public getVolcanoInfo$ = this.getVolcanoInfo.asObservable();

    getVolcanoArea = new Subject<any>();
    public getVolcanoArea$ = this.getVolcanoArea.asObservable();

    showLayerEmergency = new Subject<any>();
    public showLayerEmergency$ = this.showLayerEmergency.asObservable();

    getIncendioInfo = new Subject<any>();
    public getIncendioInfo$ = this.getIncendioInfo.asObservable();

    showLayerIncendio = new Subject<any>();
    public showLayerIncendio$ = this.showLayerIncendio.asObservable();

    constructor(
        private http: HttpClient,
        private styleService: StyleService,
        private utilsService: UtilsService,
    ) {
        const self = this;
        this.arrSelectedCatalog = new Array<ServicesCatalog>()

        this.getOSMLayer();
        // this.getLyrWmsPNOA();
        this.getLyrWmsBasePNOA();
        this.getLyrXyzPNOA();
        this.getLyrCatastro();

        this.vSourceCadastre = new VectorSource();
        this.vLayerCadastre = this.createLyrCadastre();
        
    }

    createLyrCadastre(): VectorLayer<any> {
        const lyr = new VectorLayer ({
            source: this.vSourceCadastre,
            style: this.styleService.styleFunction
        });
        lyr.setProperties({layerProperties: this.utilsService.setLayerProperties('lyrCadastre', 'Edición de parcelas', 'internal', true)});
        return lyr;
    }

    setMap(map: Map) {
        this.map = map;
    }

    getMap(): Map {
        return this.map;
    }

    getLayers(): any[] {
        this.lyrOSM.setZIndex(0);
        this.lyrPnoaBaseWms.setZIndex(1);
        this.lyrPnoa.setZIndex(2);
        this.lyrCatastro.setZIndex(3);
        this.vLayerCadastre.setZIndex(1002);

        const layers = [
            this.lyrOSM,
            this.lyrPnoaBaseWms,
            this.lyrPnoa,
            this.lyrCatastro,
            this.vLayerCadastre
        ];
        return layers;
    }

    getInfoLayer(map: Map, coor: [number, number]): string {
        this.map = map;
        const arrLayers = this.map.getLayers();
        let url = '';
        arrLayers.getArray().map((lyr: any) => {
            if ((lyr.getProperties().layerProperties.queryable === true) && (lyr.getProperties().layerProperties.infoFeature === true)) {
                this.currentLyrName = lyr.getProperties().layerProperties.title;
                if (this.currentLyrName === 'Catastro') {
                    url = lyr.getSource().getFeatureInfoUrl(
                        coor,
                        this.map.getView().getResolution(),
                        this.utilsService.epsg, { INFO_FORMAT: 'text/html' }
                    );
                } else {
                    url = lyr.getSource().getFeatureInfoUrl(
                        coor,
                        this.map.getView().getResolution(),
                        this.utilsService.epsg, { INFO_FORMAT: 'application/json' }
                    );
                }
                this.currentFeatureLyrData = this.getCurrentFeatureLyrData(url);
            }
        });
        return url;
    }

    getCurrentFeatureLyrData(url: string) {
        const self = this;
        this.http.get<any>(url).subscribe({
            next(data) {
                if (data) {
                    self.addFeatureInfoToMap.next(data.features);
                }
            },
            error() {
                self.addFeatureInfoToMap.next(url);
            }
        });
    }

    getInfoVolcanoLyrData(url: string) {
        const self = this;
        this.http.get<any>(url).subscribe({
            next(data) {
                if (data) {
                    self.getVolcanoInfo.next(data.features);
                }
            },
            error() {
                self.getVolcanoInfo.next(url);
            }
        });
    }

    getAreaVolcano(url: string) {
        const self = this;
        this.http.get<any>(url).subscribe({
            next(data) {
                if (data) {
                    self.getVolcanoArea.next(data.features);
                }
            },
            error() {
                self.getVolcanoArea.next(url);
            }
        });
    }

    getInfoEmergencyLyrData(url: string) {
        const self = this;
        this.http.get<any>(url).subscribe({
            next(data) {
                if (data) {
                    self.getIncendioInfo.next(data.features);
                }
            },
            error() {
                self.getIncendioInfo.next(url);
            }
        });
    }


    getOptionWMTS(catalog: any): any {

        const resolutions = new Array(30);
        const matrixIds  = new Array(30);
        const projection = OlProj.get('EPSG:4326');
        const projectionExtent = projection ? projection.getExtent() : null;
        if (!projectionExtent) {
            throw new Error('Projection is null');
        }
        const size = projectionExtent ? OlExt.getWidth(projectionExtent) / 512 : 0;
        for (let z = 0; z < 29; ++z) {
            // generate resolutions and matrixIds arrays for this WMTS
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = 'EPSG:4326:' + z;
        }

        const options = {
            url: catalog.url,
            layer: catalog.activeLayers,
            TileMatrix: 30,
            format: 'image/jpeg',
            projection: projection as OlProj.Projection,
            matrixSet: 'EPSG:4326',
            tileGrid: new OlTileGrid({
                origin: OlExt.getTopLeft(projectionExtent as OlExt.Extent),
                resolutions,
                matrixIds
            }),
            style: 'default',
            wrapX: true
        };
        return options;
    }

    getOSMLayer() {
        this.lyrOSM = new TileLayer({
            source: new OSM({
                url:'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
        });
        this.lyrOSM.setProperties(
            {layerProperties: this.utilsService.setLayerProperties('OSM', 'OSM', 'base', true, true, false)}
        );
    }

    getLayerMdt() {
        const resolutions = new Array(30);
        const matrixIds  = new Array(30);
        const projection = OlProj.get('EPSG:4326');
        const projectionExtent = projection ? projection.getExtent() : null;
        if (!projectionExtent) {
            throw new Error('Projection is null');
        }
        const size = projectionExtent ? OlExt.getWidth(projectionExtent) / 512 : 0;
        for (let z = 0; z < 29; ++z) {
            // generate resolutions and matrixIds arrays for this WMTS
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = 'EPSG:4326:' + z;
        }

        const options = {
            url: 'http://servicios.idee.es/wmts/mdt',
            layer: 'EL.GridCoverage',
            TileMatrix: 30,
            format: 'image/jpeg',
            projection: projection as OlProj.Projection,
            matrixSet: 'EPSG:4326',
            tileGrid: new OlTileGrid({
                origin: OlExt.getTopLeft(projectionExtent as OlExt.Extent),
                resolutions,
                matrixIds
            }),
            style: 'default',
            wrapX: true
        };

        this.lyrMdt = new TileLayer({
            opacity: 1,
            source: new WMTS(options)
        });

        this.lyrMdt.setProperties({layerProperties:
      this.utilsService.setLayerProperties('MDT', 'MDT', 'base', true, true)
        });
    }

    getLyrCatastro() {
        this.lyrCatastro = new ImageLayer({
            source: new ImageWMS ({
                url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
                params: {
                    LAYERS: 'catastro',
                    VERSION: '1.1.0',
                    TILED: true
                },
                projection: this.utilsService.epsg,
                hidpi: true,
                ratio:1,
                serverType: 'geoserver'
            }),
            visible: false
        });
        this.lyrCatastro.setProperties(
            {layerProperties:
      this.utilsService.setLayerProperties(
          'Catastro',
          'Catastro',
          'info',
          this.lyrCatastro.getVisible(),
          true,
          true,
          false,
          ['https://ovc.catastro.meh.es/Cartografia/WMS/simbolos.png']
      )}
        );
    }

    getLayerGroupCadastres() {
        this.lyrCatastrosForales = new LayerGroup({
            layers: [
                this.lyrCatastroNavarra,
                this.lyrCatastroAlava,
                this.lyrCatastroGuipuzcoa,
                this.lyrCatastroVizcaya,
            ],
            maxResolution: 5,
            minResolution: 0,
            visible: false
        });
        this.lyrCatastrosForales.setProperties(
            {
                layerProperties: this.utilsService.setLayerProperties(
                    'Catastros Forales', 'Catastros Forales', 'group',
                    false,
                    true,
                    true,
                    false,
                    [
                        this.lyrCatastroNavarra.getProperties()['layerProperties'].legend,
                        this.lyrCatastroGuipuzcoa.getProperties()['layerProperties'].legend
                    ]
                )
            }
        );
    }

    getLyrCatastroNavarra() {
        this.lyrCatastroNavarra = new ImageLayer({
            source: new ImageWMS ({
                url: 'https://idena.navarra.es/ogc/ows',
                params: {
                    LAYERS: 'catastro',
                    VERSION: '1.3.0',
                    TILED: true
                },
                hidpi: true,
                ratio:1,
                serverType: 'geoserver'
            }),
            maxResolution: 5,
            minResolution: 0,
            visible: false
        });
        this.lyrCatastroNavarra.setProperties(
            {
                layerProperties:
        this.utilsService.setLayerProperties(
            'Catastro Navarra',
            'Catastro Navarra',
            'info',
            this.lyrCatastroNavarra.getVisible(),
            true,
            true,
            false,
            ['https://idena.navarra.es/ogc/ows?service=WMS&request=GetLegendGraphic&format=image/png&layer=catastro']
        )
            }
        );
    }

    getLyrCatastroVizcaya() {
        this.lyrCatastroVizcaya = new ImageLayer({
            source: new ImageWMS({
                url: 'https://geo.bizkaia.eus/arcgisserverinspire/services/Catastro_O4_ServiciosMapas/GC_WMS/MapServer/WMSServer?',
                params: {
                    LAYERS: ['0', '1', '2', '3', '4', '5', '7', '8', '9', '10'],
                    VERSION: '1.3.0',
                    TILED: true
                },
                hidpi: true,
                ratio:1,
                serverType: 'geoserver'
            }),
            maxResolution: 5,
            minResolution: 0,
            visible: false
        });
        this.lyrCatastroVizcaya.setProperties(
            {
                layerProperties:
          this.utilsService.setLayerProperties(
              'Catastro Vizcaya',
              'Catastro Vizcaya',
              'info',
              this.lyrCatastroVizcaya.getVisible(),
              true,
              true,
              false,
              undefined
          )
            }
        );
    }

    getLyrCatastroAlava() {
        this.lyrCatastroAlava = new ImageLayer({
            source: new ImageWMS ({
                url: 'https://geo.araba.eus/WMS_Katastroa',
                params: {
                    LAYERS: ['Herriguneak_Nucleos', 'Udalerriak_Municipios', 'Hirilurzatien_funtsa_Fondo_ParcelasUrbanas',
                        'PartzelaLandatarrak_ParcelasRusticas', 'EraikinTxikiak_EdificiosMenores', 'Eraikinak_Edificios',
                        'Altuerak_Alturas', 'PartzelaHiritarrak_ParcelasUrbanas', 'Testuak_Textos'],
                    VERSION: '1.3.0',
                    TILED: true
                },
                hidpi: true,
                ratio:1,
                serverType: 'geoserver'
            }),
            maxResolution: 5,
            minResolution: 0,
            visible: false
        });
        this.lyrCatastroAlava.setProperties(
            {
                layerProperties:
        this.utilsService.setLayerProperties(
            'Catastro Alava',
            'Catastro Alava',
            'info',
            this.lyrCatastroAlava.getVisible(),
            true,
            true,
            false,
            ['https://geo.araba.eus/WMS_Katastroa?request=GetLegendGraphic&version=1.3.0&' +
          'format=image/png&layer=Hirilurzatien_funtsa_Fondo_ParcelasUrbanas',
            'https://geo.araba.eus/WMS_Katastroa?request=GetLegendGraphic&version=1.3.0&' +
          'format=image/png&layer=PartzelaLandatarrak_ParcelasRusticas']
        )
            }
        );
    }

    getLyrCatastroGuipuzcoa() {
        this.lyrCatastroGuipuzcoa = new ImageLayer({
            source: new ImageWMS ({
                url: 'https://b5m.gipuzkoa.eus/inspire/wms/gipuzkoa_wms',
                params: {
                    LAYERS: ['bu.building', 'ad.Address', 'cp.CadastralZoning',
                        'cp.CadastralParcel', 'au.AdministrativeUnit', 'au.AdministrativeBoundary'],
                    VERSION: '1.3.0',
                    TILED: true
                },
                hidpi: true,
                ratio:1,
                serverType: 'geoserver'
            }),
            maxResolution: 5,
            minResolution: 0,
            visible: false
        });
        this.lyrCatastroGuipuzcoa.setProperties(
            {
                layerProperties:
          this.utilsService.setLayerProperties(
              'Catastro Guipuzcoa',
              'Catastro Guipuzcoa',
              'info',
              this.lyrCatastroGuipuzcoa.getVisible(),
              true,
              true,
              false,
              ['https://b5m.gipuzkoa.eus/inspire/wms/gipuzkoa_wms?language=es&version=1.3.0&service=WMS&' +
            'request=GetLegendGraphic&sld_version=1.1.0&layer=gipuzkoa_wms&format=image/png&STYLE=default']
          )
            }
        );
    }

    getLyrWmsPNOA() {
        this.lyrPnoaWms = new TileLayer ({
            source: new TileWMS({
                url: 'http://www.ign.es/wms-inspire/pnoa-ma',
                params: {
                    LAYERS: 'OI.OrthoimageCoverage',
                    VERSION: '1.3.0'
                }
            }),
            visible: false
        });

        const legUrl = new Array<string>();
        legUrl.push('http://www.ign.es/wms-inspire/pnoa-ma?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image/png&' +
      'LAYER=OI.OrthoimageCoverage');

        this.lyrPnoaWms.setProperties(
            {
                layerProperties:
        this.utilsService.setLayerProperties(
            'PNOA WMS', 'Ortofotografía Aérea', 'base', this.lyrPnoaWms.getVisible(), true, false, false, legUrl
        )
            }
        );
    }

    getLyrXyzPNOA() {

        this.lyrPnoa = new TileLayer ({
            source: new XYZ ({
                attributions: 'PNOA cedido por © Instituto Geográfico Nacional de España',
                url: 'https://tms-pnoa-ma.idee.es/1.0.0/pnoa-ma/{z}/{x}/{-y}.jpeg',
                maxZoom: 19
            }),
            visible: false
        });

        const metadata = new Array<string>();
        metadata.push('http://www.ign.es/csw-inspire/srv/spa/csw?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecordById&outputSchema=' +
    'http://www.isotc211.org/2005/gmd&ElementSetName=full&ID=spaignwmts_pnoa-ma </inspire_common:URL>' +
    '<inspire_common:MediaType>application/vnd.ogc.csw.GetRecordByIdResponse_xml');
        this.lyrPnoa.setProperties(
            {
                layerProperties:
        this.utilsService.setLayerProperties('PNOA TMS', 'Ortofotografía Aérea', 'base', this.lyrPnoa.getVisible(), true, false, false, undefined, metadata)
            }
        );
    }

    getLyrWmsBasePNOA() {
        this.lyrPnoaBaseWms = new TileLayer ({
            source: new TileWMS({
                url: 'https://www.ign.es/wms-inspire/ign-base',
                params: {
                    LAYERS: 'IGNBaseTodo',
                    VERSION: '1.3.0'
                }
            }),
            maxResolution: 3,
            minResolution: 0,
            visible: false
        });

        const legUrl = new Array<string>();
        legUrl.push('http://www.ign.es/wms-inspire/ign-base?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image/png&' +
      'LAYER=IGNBaseTodo');

        this.lyrPnoaBaseWms.setProperties(
            {
                layerProperties:
        this.utilsService.setLayerProperties(
            'PNOA BASE WMS', 'Base IGN', 'base', this.lyrPnoaBaseWms.getVisible(),
            true, false, false, legUrl
        )
            }
        );
    }

    getLyrXyzBasePNOA() {

        this.lyrPnoaBase = new TileLayer ({
            source: new XYZ ({
                attributions: 'PNOA cedido por © Instituto Geográfico Nacional de España',
                url: 'https://tms-ign-base.idee.es/1.0.0/IGNBaseTodo/{z}/{x}/{-y}.jpeg',
                maxZoom: 17
            }),
            maxResolution: 100000,
            minResolution: 10000,
            visible: false
        });

        const metadata = new Array<string>();
        metadata.push('http://www.ign.es/csw-inspire/srv/spa/csw?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecordById&outputSchema=' +
    'http://www.isotc211.org/2005/gmd&ElementSetName=full&ID=spaignwmts_pnoa-ma </inspire_common:URL>' +
    '<inspire_common:MediaType>application/vnd.ogc.csw.GetRecordByIdResponse_xml');
        this.lyrPnoaBase.setProperties(
            {
                layerProperties:
        this.utilsService.setLayerProperties('PNOA BASE', 'Base IGN', 'base', this.lyrPnoaBase.getVisible(), true, false, false, undefined, metadata)
            }
        );
    }

    addLayerFromCatalog(catalog: ServicesCatalog, info: boolean) {
        let lyrCat = null;
        if (catalog.type === 'WMS') {
            lyrCat = new TileLayer({
                source: new TileWMS ({
                    url: catalog.url,
                    params: {
                        LAYERS: catalog.activeLayers,
                        VERSION: catalog.capabilities.version
                    }
                }),
                visible: true
            });

            // lyrCat.values_.zIndex = this.lyrZIndex++;

            let legUrl: string[] | undefined;
            let lyrMetadata: string[] | undefined;

            catalog.activeLayers.map((lyrCatalog) => {
                const capLayer: any = catalog.capabilities.Capability.Layer.Layer.find((lyr: any) => (lyr.Name === lyrCatalog));
                if (capLayer) {

                    if (capLayer.DataURL) {
                        if (lyrMetadata === undefined) {
                            lyrMetadata = new Array<string>();
                            lyrMetadata.push(capLayer.DataURL[0].OnlineResource);
                        } else {
                            if (!lyrMetadata.find(lyr => (lyr === capLayer.DataURL[0].OnlineResource))) {
                                lyrMetadata.push(capLayer.DataURL[0]);
                            }
                        }
                    }

                    if (capLayer.MetadataURL) {
                        if (lyrMetadata === undefined) {
                            lyrMetadata = new Array<string>();
                            lyrMetadata.push(capLayer.MetadataURL[0].OnlineResource);
                        } else {
                            if (!lyrMetadata.find(lyr => (lyr === capLayer.MetadataURL[0].OnlineResource))) {
                                lyrMetadata.push(capLayer.MetadataURL[0].OnlineResource);
                            }
                        }
                    }

                    if (capLayer.Style) {
                        if (capLayer.Style[0].LegendURL) {
                            if (legUrl === undefined) {
                                legUrl = new Array<string>();
                                legUrl.push(capLayer.Style[0].LegendURL[0].OnlineResource);
                            } else {
                                if (!legUrl.find(lyr => (lyr === capLayer.Style[0].LegendURL[0].OnlineResource))) {
                                    legUrl.push(capLayer.Style[0].LegendURL[0].OnlineResource);
                                }
                            }
                        }
                    }

                }
            });

            lyrCat.setProperties(
                {
                    layerProperties:
            this.utilsService.setLayerProperties(
                catalog.title,
                catalog.activeLayers[0],
                'info', lyrCat.getVisible(),
                true,
                lyrCat.get('queryable'),
                false,
                legUrl,
                lyrMetadata
            )
                }
            );
        } else if (catalog.type === 'WMTS') {
            let options = optionsFromCapabilities(catalog.capabilities, {
                layer: catalog.activeLayers,
                matrixSet: 'EPSG:4326'
            });

            if (options === null) {
                options = this.getOptionWMTS(catalog);
                if (options === null) {
                    throw new Error('Projection is null');;
                }
            } 

            lyrCat = new TileLayer({
                opacity: 1,
                source: new WMTS(options)
            });

            lyrCat.setProperties(
                {
                    layerProperties :
                this.utilsService.setLayerProperties(
                    catalog.title, catalog.activeLayers[0], 'info', lyrCat.getVisible(), true
                )
                }
            );
        }
        /*this.lyrZIndex++;
    lyrCat.values_.zIndex = this.lyrZIndex;
    this.map.addLayer(lyrCat);*/
        for (let i = 2; i < this.map.getLayers().getArray().length - 1; i++) {
            this.map.getLayers().getArray()[i].setZIndex(i + 1);
        }
        if (lyrCat) {
            lyrCat.setZIndex(2);
        } else {
            throw new Error('Layer is null');
        }
        this.map.addLayer(lyrCat);

        this.addLayerToMap.next(true);

    }

    setVisibleLayer(lyrName: string) {
        const lyrVisibility = this.getLayerBy(this.map, 'name', lyrName);
        if (lyrVisibility) {
            lyrVisibility.setVisible(true);
        }
    }

    setHideLayer(lyrName: string) {
        const lyrVisibility = this.getLayerBy(this.map, 'name', lyrName);
        if (lyrVisibility) {
            lyrVisibility.setVisible(false);
        }
    }

    setVisibilityLayer(lyrName: string) {
        const lyrVisibility = this.getLayerBy(this.map, 'name', lyrName);
        const visible = !lyrVisibility.getVisible();
        if (lyrVisibility) {
            if (lyrVisibility.getProperties().layerProperties.type === 'group') {
                lyrVisibility.setVisible(visible);
                lyrVisibility.getProperties().layers.forEach((lyr: Layer) => {
                    lyr.setVisible(visible);
                });
            } else {
                lyrVisibility.setVisible(visible);
            }
        }
    }

    getVisibilityLayer(lyrName: string): boolean {
        const lyrVisibility = this.getLayerBy(this.map, 'name', lyrName);
        if (lyrVisibility) {
            return lyrVisibility.getVisible() === true;
        }
        return false;
    }

    setOpacityLayer(lyrName: string, opacity: number) {
        const lyrOpacity = this.getLayerBy(this.map, 'name', lyrName);
        lyrOpacity.setOpacity(opacity / 100);
        lyrOpacity.getProperties().layerProperties.opacity = opacity;
    }

    reorderLayer(lyrName: string, drag: number, drop: number) {
        const lyr = this.getLayerBy(this.map, 'name', lyrName);

        if (drag > drop) {
            for (let i = drop; i < drag; i++) {
                const lyrUpdate = this.getLayerBy(this.map, 'zIndex', i);
                lyrUpdate.prototype.setZIndex(i + 1);
            }
        } else {
            for (let i = drag + 1; i < drop; i++) {
                const lyrUpdate = this.getLayerBy(this.map, 'zIndex', i);
                lyrUpdate.prototype.setZIndex(i - 1);
            }
        }
        lyr.prototype.setZIndex(drop);
    }

    getLayerBy(map: any, key: any, value: any): any { // TODO Group layers
        const layers = map.getLayers().getArray();
        const layer: Layer | undefined = layers.find((l: Layer) => l.getProperties()['layerProperties'][key] === value);
        return layer;
    }

    getConflictFeature(geom: string, srs: string, name: string, type: string, mode: string, label: string, visible: boolean = true):
    OlFeature {
        const feature = this.utilsService.getFeatureFromWkt(geom, srs);
        feature.setProperties(
            {id: name, type, visible, mode, label}
        );

        return feature;
    }

    addLayer(layer: Layer) {
        if (layer === undefined) {
            return;
        }

        this.map.addLayer(layer);
        this.addLayerToMap.next(true);
    }

    removeLayer(layer: Layer) {
        if (layer === undefined) {
            return;
        }

        this.map.removeLayer(layer);
        this.removeLayerFromMap.next(true);
    }

}
