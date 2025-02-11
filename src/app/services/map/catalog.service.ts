import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError, Subject } from 'rxjs';
import { WMSCapabilities, WMTSCapabilities } from 'ol/format';
import { ServicesCatalog } from '../../models/catalog/servicesCatalog.model';
import { CatalogByCategory } from '../../models/catalog/catalogByCategory.model';
import { TreeNode } from 'primeng/api';
import { NodeCatalog } from '../../models/catalog/nodeCatalog.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  urlsServices: ServicesCatalog[];
  filesTree: TreeNode[];
  getServiceCapabilities = new Subject<any>();
  public getServiceCapabilities$ = this.getServiceCapabilities.asObservable();

  constructor(protected http: HttpClient) {

    this.urlsServices = new Array<ServicesCatalog>();
    // Estatales
    this.addCatalogService(
      'Peligrosidad por Inundación',
      'https://servicios.idee.es/wms-inspire/riesgos-naturales/inundaciones',
      'WMS',
      'Estatales',
      false
    );
    this.addCatalogService(
      'Copernicus Land Monitoring Service',
      'https://servicios.idee.es/wms/copernicus-landservice-spain',
      'WMS',
      'Estatales',
      false
    );
    this.addCatalogService(
      'Ocupación del Suelo',
      'https://servicios.idee.es/wms-inspire/ocupacion-suelo',
      'WMS',
      'Estatales',
      false
    );
    this.addCatalogService(
      'Hidrografía - Información Geográfica de Referencia',
      'https://servicios.idee.es/wms-inspire/hidrografia',
      'WMS',
      'Estatales',
      false
    );
    /*this.addCatalogService(
      'Agua - Aguas Subterráneas - Catálogo de Sondeos',
      'http://wms.magrama.es/sig/Agua/Sondeos/wms.aspx',
      'WMS',
      'Estatales',
      false
    );*/
    this.addCatalogService(
      'Red de Transporte - Información Geográfica de Referencia',
      'https://servicios.idee.es/wms-inspire/transportes',
      'WMS',
      'Estatales',
      false
    );
    this.addCatalogService(
      'Mapa Raster',
      'https://www.ign.es/wmts/mapa-raster',
      'WMTS',
      'Estatales',
      false
    );

  }

  addCatalogService(title, url, type, scope, info) {
    if (this.urlsServices.find(service => (service.url === url))) {
      //this.infoService.setInfo('duplicate_catalog', 'catalog');
    } else {
      const catService = new ServicesCatalog();
      catService.title = title;
      catService.url = url;
      catService.type = type;
      catService.scope = scope;
      this.getCapabilities(catService, info);
    }
  }

  getCatalogByCategory(catalogs: ServicesCatalog[], f: Function): CatalogByCategory[] {
    const groupByObjects = catalogs.reduce((r: any, v: any, i: any, a: any, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
    const groupByModels: CatalogByCategory[] = [];
    for (let obj in groupByObjects) {
      if (!groupByObjects.hasOwnProperty(obj)) {
        continue;
      }
      const conCategory = new CatalogByCategory();
      conCategory.catalog = groupByObjects[obj];
      if (obj === 'null') {
        obj = 'Sin categoría';
      }
      conCategory.key = obj;
      groupByModels.push(conCategory);
    }
    return groupByModels;
  }

  generateTreeNodeCatalog(catalogs: ServicesCatalog[]): any {
    const treeTableCatalog = new Array<NodeCatalog>();

    const conCategory = this.getCatalogByCategory(catalogs, (a) => a.scope);

    conCategory.map((categories: CatalogByCategory) => {
      const nodeCatalog = new NodeCatalog();
      nodeCatalog.data = categories;
      nodeCatalog.expanded = true;
      const childrenNodeCatalog = new Array<NodeCatalog>();

      categories.catalog.map((catalog: ServicesCatalog) => {
        const childNode = new NodeCatalog();
        childNode.data = catalog.title;
        childrenNodeCatalog.push(childNode);
      });

      nodeCatalog.children = childrenNodeCatalog;
      treeTableCatalog.push(nodeCatalog);
    });

    const treeCatalog = new Array<NodeCatalog>();
    // Nodes Para Tree Multiple Selection with Checkbox PrimeNG
    conCategory.map((categories: CatalogByCategory) => {
      const nodeCatalog = new NodeCatalog();
      nodeCatalog.label = categories.key;
      nodeCatalog.data = categories.key;
      nodeCatalog.expandedIcon = 'fa fa-folder-open';
      nodeCatalog.collapsedIcon = 'fa fa-folder';
      nodeCatalog.selectable = false;
      nodeCatalog.leaf = true;

      const childrenNodeCatalog = new Array<NodeCatalog>();

      // Children para Tree Multiple Selection with Checkbox PrimeNG

      categories.catalog.map((catalog: ServicesCatalog) => {
        const childrenNodeLayer = new Array<NodeCatalog>();
        const childNode = new NodeCatalog();
        childNode.label = catalog.title;
        childNode.data = catalog.title;
        childNode.expandedIcon = 'fa fa-folder-open';
        childNode.collapsedIcon = 'fa fa-folder';
        childNode.selectable = false;
        childNode.leaf = true;
        if (catalog.type === 'WMS') {
          catalog.capabilities.Capability.Layer.Layer.map((lyr) => {
            const childCapabilitiesNode = new NodeCatalog();
            childCapabilitiesNode.label = lyr.Title;
            childCapabilitiesNode.data = lyr.Name;
            childCapabilitiesNode.type = catalog.type;
            childrenNodeLayer.push(childCapabilitiesNode);
          });
          childNode.children = childrenNodeLayer.reverse();
        } else if (catalog.type === 'WMTS') {
          catalog.capabilities.Contents.Layer.map((lyr) => {
            const childCapabilitiesNode = new NodeCatalog();
            childCapabilitiesNode.label = lyr.Title;
            childCapabilitiesNode.data = lyr.Identifier;
            childCapabilitiesNode.type = catalog.type;
            childrenNodeLayer.push(childCapabilitiesNode);
          });
          childNode.children = childrenNodeLayer.reverse();
        }

        childrenNodeCatalog.push(childNode);
      });


      nodeCatalog.children = (childrenNodeCatalog.sort()).reverse();
      treeCatalog.push(nodeCatalog);
    });

    return treeCatalog as Array<TreeNode>;
    // this.getContextsData.next([<TreeNode[]> treeCatalog, catalogs]);
  }

  getCapabilities(service: ServicesCatalog, info) {
    const self = this;
    let params = new HttpParams();

    params = params.append('request', 'getcapabilities');
    params = params.append('service', service.type);
    params = params.append('version', '1.1.0');


    this.http.get(service.url, { params, responseType: 'text' }).subscribe({
      next(capabilities) {
        if (capabilities) {
          if (service.type === 'WMS') {
            const parser = new WMSCapabilities();
            const result = parser.read(capabilities);
            service.capabilities = result;
            self.urlsServices.push(service);
            if (info === true) {
              //self.infoService.setInfo('add_catalog', 'catalog', 'el catálogo ' + service.title + ' se ha añadido crrectamente');
            }
            self.getServiceCapabilities.next(self.urlsServices);
          } else if (service.type === 'WMTS') {
            const parser = new WMTSCapabilities();
            const result = parser.read(capabilities);
            service.capabilities = result;
            self.urlsServices.push(service);
            if (info === true) {
              //self.infoService.setInfo('add_catalog', 'catalog', 'el catálogo ' + service.title + ' se ha añadido crrectamente');
            }
            self.getServiceCapabilities.next(self.urlsServices);
          }
          // self.parseCapabilities(capabilities, service.type);
        }
      },
      error(error) {
        self.handleError(error);
      }
    }
    );
  }

  handleError(error: HttpErrorResponse) {

    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.

      //this.errorService.handleError(error, 'catalog');
      /*console.error('An error occurred:', error.error.message);*/
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      //this.errorService.handleError(error, 'catalog');
      /*console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);*/
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}
