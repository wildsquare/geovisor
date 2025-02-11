import { Component, OnInit, ViewChildren, ViewChild } from '@angular/core';
import { TreeNode, SelectItem } from 'primeng/api';
import { ServicesCatalog } from '../models/catalog/servicesCatalog.model';
import { Subscription } from 'rxjs';
import { LayersService } from '../services/map/layers.service';
import { CatalogService } from '../services/map/catalog.service';
import { ComponentsService } from '../services/core/components.service';
import { TocComponent } from './toc.component';
import { UtilsService } from '../services/core/utils.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {

  @ViewChild ('drptype', {static: true}) drptype;
  @ViewChild ('drpscope', {static: true}) drpscope;
  @ViewChild ('inpurl', {static: true}) inpurl;
  @ViewChild ('inptitle', {static: true}) inptitle;

  transpDis: 100;
  transpFinca: 100;
  transpCatas: 100;
  transpPnoa: 100;
  icoVis: 'assets/resources/base-topo.png';
  icoNoVis: 'assets/resources/base-oscuro.png';
  filesTree: TreeNode[];
  filesTreeTable: ServicesCatalog[];
  selectedServices: TreeNode[];
  arrSelectedCatalog: ServicesCatalog[];
  rowGroupMetadata: any;
  actionRefreshCatalog: Subscription = null;
  groupedType: SelectItem[];
  groupedScope: SelectItem[];

  catalogLayersService: any;

  constructor(
    private layersService: LayersService,
    private catalogService: CatalogService,
    private componentsService: ComponentsService,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {

    const self = this;

    this.groupedType = [];
    this.groupedType = [
      {label: 'WMS', value: 'WMS'},
      {label: 'WMTS', value: 'WMTS'}
    ];

    this.groupedScope = [];
    this.groupedScope = [
      {label: 'Estatales', value: 'Estatales'},
      {label: 'Autonómico', value: 'Autonomico'},
      {label: 'Provincial', value: 'Provincial'},
      {label: 'Otros', value: 'Otros'},
    ];

    this.filesTree = this.catalogService.filesTree;
    this.selectedServices = new Array<TreeNode>();
    this.filesTreeTable = this.catalogService.urlsServices;
    this.filesTree = this.catalogService.generateTreeNodeCatalog(this.filesTreeTable);

    this.catalogLayersService = this.layersService;

    this.arrSelectedCatalog = this.catalogLayersService.arrSelectedCatalog;
    this. actionRefreshCatalog = this.catalogService.getServiceCapabilities$.subscribe(
      (data) => {
        self.filesTreeTable = self.catalogService.urlsServices;
        self.filesTree = self.catalogService.generateTreeNodeCatalog(self.filesTreeTable);
        self.filesTree[0].expanded = true;
        self.checkNode();
      }
    );

    this.checkNode();
  }

  addLayersFromCatalog(info: boolean) {
    this.deleteLayersCatalog();
    this.arrSelectedCatalog.map((catalog) => {
      this.catalogLayersService.addLayerFromCatalog(catalog, info);
    });
  }

  handleChange(capa, event) {
    this.catalogLayersService.setOpacityLayer(capa, event.value);
  }

  handleClick() {
    this.addCatalog();
  }

  addCatalog() {
    let dirty = false;
    if (this.drpscope.value === undefined) {
      //this.infoService.setInfo('no_scope', 'catalog');
      dirty = true;
    }
    if (this.drptype.value === undefined) {
      //this.infoService.setInfo('no_type', 'catalog');
      dirty = true;
    }
    if (this.inptitle.nativeElement.value === undefined) {
      //this.infoService.setInfo('no_title', 'catalog');
      dirty = true;
    }
    if (this.inpurl.nativeElement.value === undefined) {
      //this.infoService.setInfo('no_url', 'catalog');
      dirty = true;
    }

    if (dirty === false) {
      this.catalogService.addCatalogService(
        this.inptitle.nativeElement.value,
        this.inpurl.nativeElement.value,
        this.drptype.value,
        this.drpscope.value,
        true
      );
    }
  }

  deleteLayersCatalog() {
    this.filesTreeTable.map((catalog) => {
      this.catalogLayersService.map.removeLayer(
        this.catalogLayersService.getLayerBy(this.catalogLayersService.getMap(), 'name', catalog.title)
      );
    });
  }

  nodeSelect(event) {
    if (event.node.children) {
      const parent = event.node;
      event.node.children.map((child) => {
        if (child.parent === undefined) {
          child.parent = parent;
        }
        this.setActiveLayer(child);
      });
    } else {
      this.setActiveLayer(event.node);
    }
  }

  nodeUnselect(event) {
    if (event.node.children) {
      const parent = event.node;
      event.node.children.map((child) => {
        if (child.parent === undefined) {
          child.parent = parent;
        }
        this.deleteActiveLayer(child);
      });
    } else {
      this.deleteActiveLayer(event.node);
    }
  }

  setCatalog(catalogs) {
    this.arrSelectedCatalog.push(this.filesTreeTable.find(catalog => (catalog.title === catalogs.title)));
    this.catalogLayersService.arrSelectedCatalog = this.arrSelectedCatalog;
    // this.mapService.selectContexts();
    this.updateRowGroupMetaData();
  }

  deleteCatalog(catalogs) {
    this.arrSelectedCatalog.splice(
      this.arrSelectedCatalog.indexOf(this.arrSelectedCatalog.find(catalog => (catalog.title === catalogs.title))), 1
    );
    this.catalogLayersService.arrSelectedCatalog = this.arrSelectedCatalog;
    this.updateRowGroupMetaData();
  }

  setActiveLayer(layer) {
    const selCatalog = this.arrSelectedCatalog.find(catalog => (catalog.title === layer.parent.data));
    if (selCatalog) {
      if (selCatalog.type === 'WMTS') {
        selCatalog.activeLayers = new Array<string>();
        this.selectedServices.splice(
          this.selectedServices.indexOf(this.selectedServices.find(node => (node.parent.data === selCatalog.title))), 1
        );
      }
      selCatalog.activeLayers.push(layer.data);
      this.catalogLayersService.arrSelectedCatalog = this.arrSelectedCatalog;
    } else {
      const fndCatalog = this.filesTreeTable.find(catalog => (catalog.title === layer.parent.data));
      fndCatalog.activeLayers = new Array<string>();
      fndCatalog.activeLayers.push(layer.data);
      this.setCatalog(fndCatalog);
    }
  }

  deleteActiveLayer(layer) {
    const selCatalog = this.arrSelectedCatalog.find(catalog => (catalog.title === layer.parent.data));
    if (selCatalog) {
      selCatalog.activeLayers.splice(selCatalog.activeLayers.indexOf(selCatalog.activeLayers.find(lyr => (lyr === layer.data))), 1);
      if (selCatalog.activeLayers.length === 0) {
        this.deleteCatalog(selCatalog);
      }
    }
  }

  onSort() {
    this.updateRowGroupMetaData();
  }

  updateRowGroupMetaData() {
    this.rowGroupMetadata = {};
    if (this.arrSelectedCatalog) {
        for (let i = 0; i < this.arrSelectedCatalog.length; i++) {
          const rowData = this.arrSelectedCatalog[i];
          const category = rowData.scope;
          if (i === 0) {
              this.rowGroupMetadata[category] = { index: 0, size: 1 };
          } else {
            const previousRowData = this.arrSelectedCatalog[i - 1];
            const previousRowGroup = previousRowData.scope;
            if (category === previousRowGroup) {
              this.rowGroupMetadata[category].size++;
            } else {
              this.rowGroupMetadata[category] = { index: i, size: 1 };
            }
          }
        }
    }
  }

  checkNode() {
    if (this.filesTree !== undefined) {
      this.filesTree.forEach(node => {
        let allChildren = true;
        if (node.children !== undefined) {
          node.children.forEach(child => {
            // check child if the parent is not selected
            const fndCatalog = this.arrSelectedCatalog.find(catalog => (catalog.title === child.data));
            if (fndCatalog) {
              child.children.forEach(lyr => {
                if (fndCatalog.activeLayers.find(layer => (layer === lyr.data))) {
                  this.selectedServices.push(lyr);
                }
              });
            //  child.partialSelected = true;
            } else {
              allChildren = false;
            }

            // check the child if the parent is selected
            // push the parent in str to new iteration and mark all the childs
          });
        } else {
          return;
        }

        if (allChildren === true) {
          this.selectedServices.push(node);
          // node.partialSelected = true;
        }
      });
    }
  }

  setTocComponent() {
    this.addLayersFromCatalog(true);
    this.componentsService.removeComponents(this.componentsService.tocContainer);
    this.componentsService.addComponent(this.componentsService.tocContainer, TocComponent);
  }
}