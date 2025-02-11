import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import { LayersService } from '../services/map/layers.service';
import { UtilsService } from '../services/core/utils.service';
import { MapService } from '../services/map/map.service';
import { TocComponent } from "../toc/toc.component";
import { DialogModule } from 'primeng/dialog';
import { DockModule } from 'primeng/dock';
import { TooltipModule } from 'primeng/tooltip';
import { DndFilesComponent } from '../dnd/dnd-files.component';
import { LoadFilesService } from '../services/core/load-files.service';
import { Subscription } from 'rxjs';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ProjectsService } from '../services/bussines/projects.service';
import { Parcel } from '../models/bussines/parcel.model';
import { ProjectsComponent } from '../projects/projects.component';
import { ParcelsService } from '../services/bussines/parcels.service';
import { Polygon } from 'ol/geom';
import { ParcelsComponent } from '../parcels/parcels.component';
import { CatalogComponent } from "../toc/catalog.component";

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
  imports: [DialogModule, TocComponent, DockModule, TooltipModule, DndFilesComponent,
    ToolbarModule, ButtonModule, ProjectsComponent, ParcelsComponent, CatalogComponent]
})
export class MapComponent implements OnInit {
    @ViewChild('banner', { static: true }) banner!: ElementRef;

    map!: Map;
    view!: View;

    tocVisible = false;
    parcelsVisible = false;
    proyectsVisible = false;
    catalogVisible = false;
    
    dockItems!:  any[];
    actionShowCatalog: Subscription = new Subscription();
    actionLoadParcels: Subscription = new Subscription();

    constructor(
        private layerServices: LayersService,
        private mapServices: MapService,
        private utilsService: UtilsService,
        private loadFileService: LoadFilesService,
        private projectsService: ProjectsService,
        private parcelsService: ParcelsService
    ) { 
    }

    ngOnInit(): void {
        this.parcelsService.demoParcels = new Array<Parcel>();
        this.dockItems = [
            {
                label: 'Proyectos',
                icon: 'pi pi-bars',
                command: () => {
                    this.showOverlay(1);
                }
            },
            {
                label: 'Catálogo de Parcelas',
                icon: 'pi pi-th-large',
                command: () => {
                    this.showOverlay(2);
                }
            },
            {
                label: 'Capas',
                icon: 'pi pi-clone',
                command: () => {
                    this.showOverlay(3);
                }
            },
            {
                label: 'Catálogo',
                icon: 'pi pi-map',
                command: () => {
                    this.showOverlay(4);
                }
            }

        ];
        this.view = new View({
            center: this.utilsService.center,
            projection: this.utilsService.epsg,
            zoom: this.utilsService.zoom,
            maxZoom: 21
        });
        const lyrs = this.layerServices.getLayers();
        this.map = new Map({
            target: 'map',
            layers: lyrs,
            view: this.view,
        });
        this.map.on('postrender', (event) => {
            this.mapServices.mapResolution = event.target.getView().getResolution();
            this.mapServices.getMapResolution.next(event.target.getView().getResolution());
        });
        this.map.removeControl(this.map.getControls().item(0));
        this.layerServices.setMap(this.map);
        this.mapServices.setMap(this.map);
        this.actionLoadParcels = this.loadFileService.loadParcelFeatures.subscribe(
            (arrfeature: Feature[]) => {
                this.loadDataDemo(arrfeature);
            }
        );
        this.loadFileService.getGeoJSONFile('jerez.geojson');
        this.loadFileService.getGeoJSONFile('monyita.geojson');
        this.loadFileService.getGeoJSONFile('Valdeapa.geojson');
        // this.loadFileService.getGeoJSONFile('Guadalquiton.geojson');
        this.loadFileService.getGeoJSONFile('11033A00400008.geojson');
        this.loadFileService.getGeoJSONFile('53020A00500052.geojson');
        this.loadFileService.getGeoJSONFile('53020A11900142.geojson');
        this.loadFileService.getGeoJSONFile('53020A14600010.geojson');
        this.loadFileService.getGeoJSONFile('3367701TF9136N.geojson');

    }

    loadBanner($event: any): void {
        if (!$event) {
            this.banner.nativeElement.className = 'banner-off';
        } else {
            this.banner.nativeElement.className = 'banner-on';
        }
    }
    /**
     * on file drop handler
     */
    onFileDropped($event: any): void {
        this.loadFileService.addFilesToUpload($event);
    }

    showOverlay(componentNumber: number): void {
        // this.loadFileRouterService.toComponent = '';
        // this.loadFileRouterService.fromComponent = '';
        // this.loadFilesOverlayService.hideLoadFiles();
        if (componentNumber === 1){
            // layers sidebar right bottom
            this.proyectsVisible = true;
        } else if(componentNumber === 2){
                // layers sidebar right bottom
            this.parcelsVisible = true;
        } else if (componentNumber === 3){
            // catalog sidebar right bottom
            this.tocVisible = true;
        } else if (componentNumber === 4){
            // catalog sidebar right bottom
            this.catalogVisible = true;
        }
        
    }

    loadDataDemo(arrfeature: Feature[]): void {
        arrfeature.map((fet: Feature) => {
            const parcel = new Parcel();
            parcel.feature = fet;
            parcel.name = fet.get('localId');
            parcel.title = fet.get('localId');
            parcel.infoFeature = false;
            const geom = parcel.feature.getGeometry() as Polygon;
            parcel.area = geom.getArea();
            parcel.visible = true;
            if (parcel.name  === 'Jerez' || parcel.name  === 'moñita') {
                parcel.type = 'solar';
                fet.set('type', 'solar');
                const project = this.projectsService.demoProjects.find((pro) => pro.name === 'Solar');
                parcel.projectTitle = project ? project.title : 'Sin Proyecto';
                if (project) {
                    project.parcels.push(parcel);
                }
            } else if (parcel.name  === 'Valdeapa' || parcel.name === '11033A00400008' || parcel.name === '3367701TF9136N') {
                parcel.type = 'biodiversidad';
                fet.set('type', 'biodiversidad');
                const project = this.projectsService.demoProjects.find((pro) => pro.name === 'Biodiversidad');
                parcel.projectTitle = project ? project.title : 'Sin Proyecto';
                if (project) {
                    project.parcels.push(parcel);
                }
            } else {
                fet.set('type', 'provisional');
                parcel.projectTitle = 'Sin Proyecto';
            }
            this.parcelsService.demoParcels.push(parcel);
        });

    }

}
