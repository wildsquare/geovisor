import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import GML32 from 'ol/format/GML32';
import { GeoJSON, WFS } from 'ol/format';
import { LayersService } from '../map/layers.service';
import { HttpClient } from '@angular/common/http';
import GMLBase from 'ol/format/GMLBase';
import { UtilsService } from './utils.service';
import { Feature } from 'ol';

@Injectable({
  providedIn: 'root'
})
export class LoadFilesService {

  addFilesLoadPanel = new Subject<File[]>();
  uploadedFiles = new Array<File>();

  loadParcelFeatures = new Subject<Feature[]>();

  constructor(
    private utilsService: UtilsService,
    private layerServices: LayersService,
    private http: HttpClient
  ) { }

    addFilesToUpload(filesToUpload: FileList) {
      const self = this;
      const candidateFiles = new Array<File>();
      Array.from(filesToUpload).map(
          (file) => {
              if (!self.uploadedFiles.find(f => f.name === file.name)) {
                  candidateFiles.push(file);
              } else {
                throw new Error('Ya se ha cargado este fichero');
                  // this.errorService.handleError(this.errorService.setError(2, file.name, 'Ya se ha cargado este fichero'), 'load-file');
              }
          }
      );
      this.addFilesLoadPanel.next(candidateFiles);
    }

    loadFile(docFile: File) {
      const self = this;

      const fileName = docFile.name as string;
      let strExtension = fileName.split('.')[docFile.name.split('.').length - 1];
      if (strExtension === 'geojson') {
        this.loadGeoJSONFeaturesFromFile(docFile);
      }
      // this.utilsService.startLoadingPanel.next(this.translate.instant('FileValidationService.loadFile') as string);
      
      // this.loadWfsFeatures(docFile);
      // this.loadWfsFeature(docFile);
      // this.loadGmlFeatures(docFile);
      // this.getLoadFileInfo.next(this.translate.instant('FileValidationService.process') + docFile.name as string);
      
    }

    loadGeoJSONFeaturesFromFile(file:File) {
      const self = this;
      const reader = new FileReader();      
      reader.readAsDataURL(file);
      reader.onload =  () => {
          if (typeof reader.result === 'string' ) {
              const filegml64 = reader.result.toString().split(',')[1];
              const filegml = atob(filegml64);
              self.loadGeoJSONFeatures(filegml);
          }
      };

      reader.onerror = (error) => {
          //self.handleFileServiceError(error, docFile.name as string);
          //self.getNextFileToLoad.next(docFile.name as string);
          throw new Error('Error al cargar el fichero');
      };
    }

    loadGeoJSONFeatures(strGeojson: any) {
      const geojson = new GeoJSON();
      const geojsonFeatures = geojson.readFeatures(strGeojson);
      if (geojsonFeatures) {
        const epsg = geojson.readProjection(strGeojson);
        if (epsg.getCode() !== this.utilsService.epsg) {
          geojsonFeatures.forEach(
            (feature: Feature) => feature.getGeometry()?.transform(epsg, this.utilsService.epsg)
          );
        }
        this.layerServices.vSourceCadastre.addFeatures(geojsonFeatures);
      }
      this.loadParcelFeatures.next(geojsonFeatures);
    }

    loadWfsFeatures(file: File) {
      const self = this;
      const wfs = new WFS();
      
      const wfsFeature = wfs.readFeatures(file);
      self.layerServices.vSourceCadastre.addFeatures(wfsFeature);
    }

    loadWfsFeature(docFile: File) {
      const self = this;

      // this.utilsService.startLoadingPanel.next(this.translate.instant('FileValidationService.loadFile') as string);
      const reader = new FileReader();

      // this.getLoadFileInfo.next(this.translate.instant('FileValidationService.process') + docFile.name as string);
      const fileName = docFile.name as string;
      let strExtension = fileName.split('.')[docFile.name.split('.').length - 1];

      reader.onload =  () => {
          if (typeof reader.result === 'string' ) {
              const filegml64 = reader.result.toString().split(',')[1];
              const filegml = atob(filegml64);
              const extension = strExtension.toLowerCase();
              if (extension === 'gml' || extension === 'xml') {
                const wfs = new WFS();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(filegml, "application/xml");
                const gmlFeature = wfs.readFeatureFromDocument(xmlDoc);
                const xmlDoc64 = parser.parseFromString(filegml64, "application/xml");
                const gmlFeature64 = wfs.readFeatureFromDocument(xmlDoc64);
                self.layerServices.vSourceCadastre.addFeature(gmlFeature64);
                self.layerServices.vSourceCadastre.addFeature(gmlFeature);
              }

          }
      };

      reader.onerror = (error) => {
          //self.handleFileServiceError(error, docFile.name as string);
          //self.getNextFileToLoad.next(docFile.name as string);
          throw new Error('Error al cargar el fichero');
      };
    }

    loadGmlFeatures(docFile: File) {
      const self = this;
      const reader = new FileReader();
      const fileName = docFile.name as string;
      let strExtension = fileName.split('.')[docFile.name.split('.').length - 1];
      reader.readAsDataURL(docFile);

      reader.onload =  () => {
          if (typeof reader.result === 'string' ) {
              const filegml64 = reader.result.toString().split(',')[1];
              const filegml = atob(filegml64);
              const extension = strExtension.toLowerCase();
              if (extension === 'gml' || extension === 'xml') {
                const gml = new GMLBase();
                const gmlFeatures = gml.readFeatures(filegml64);
                self.layerServices.vSourceCadastre.addFeatures(gmlFeatures);
              }

          }
      };

      reader.onerror = (error) => {
          //self.handleFileServiceError(error, docFile.name as string);
          //self.getNextFileToLoad.next(docFile.name as string);
          throw new Error('Error al cargar el fichero');
      };
    }
    
    getGeoJSONFile(name: string) {
      const self = this;
      const sldURL = './assets/geojson/' + name;
      this.http.get(sldURL, {responseType: 'text' }).subscribe(data => {
        self.loadGeoJSONFeatures(data);
      });

    }



}
