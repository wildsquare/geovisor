import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { ServicesCatalog } from '../models/catalog/servicesCatalog.model';
import { Subscription } from 'rxjs';
import { LayersService } from '../services/map/layers.service';
import { CatalogService } from '../services/map/catalog.service';
import { Select } from 'primeng/select';
import { TreeModule } from 'primeng/tree';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';

interface Type {
  label: string;
  code: string;
}

interface Scope {
  label: string;
  code: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css'],
  imports: [
    FormsModule, Select, TreeModule, ScrollPanelModule, ButtonModule, TabsModule
  ]
})
export class CatalogComponent implements OnInit {

  @ViewChild('drptype', {static: true}) drptype: any;
  @ViewChild ('drpscope', {static: true}) drpscope: any;
  @ViewChild ('inpurl', {static: true}) inpurl: any;
  @ViewChild ('inptitle', {static: true}) inptitle: any;

  transpDis!: 100;
  transpFinca!: 100;
  transpCatas!: 100;
  transpPnoa!: 100;
  icoVis!: 'assets/resources/base-topo.png';
  icoNoVis!: 'assets/resources/base-oscuro.png';
  filesTree!: TreeNode[];
  filesTreeTable!: ServicesCatalog[];
  selectedServices!: TreeNode[];
  arrSelectedCatalog!: ServicesCatalog[];
  rowGroupMetadata: any;
  actionRefreshCatalog: Subscription = new Subscription();
  groupedType!: Type[];
  selectedType!: Type;
  groupedScope!: Scope[];
  selectedScope!: Scope;

  catalogLayersService: any;

  constructor(
    private layersService: LayersService,
    private catalogService: CatalogService
  ) { }

  ngOnInit() {

    const self = this;

    this.groupedType = [
      {label: 'WMS', code: 'WMS'},
      {label: 'WMTS', code: 'WMTS'}
    ];

    this.groupedScope = [
      {label: 'Ecosistemas', code: 'Ecosistemas'},
      {label: 'Fauna y Flora', code: 'Fauna y Flora'},
      {label: 'Recursos Genéticos', code: 'Recursos Genéticos'},
      {label: 'Red Natura', code: 'Red Natura'},
    ];

    this.filesTree = this.catalogService.filesTree;
    this.selectedServices = new Array<TreeNode>();
    this.filesTreeTable = this.catalogService.urlsServices;
    this.filesTree = this.catalogService.generateTreeNodeCatalog(this.filesTreeTable);

    this.catalogLayersService = this.layersService;

    this.arrSelectedCatalog = this.layersService.arrSelectedCatalog;
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

  handleChange(capa: any, event: { value: number }) {
    this.catalogLayersService.setOpacityLayer(capa, event.value);
  }

  handleClick() {
    this.addCatalog();
  }

  addCatalog() {
    let dirty = false;
    if (this.selectedScope.code === undefined) {
      //this.infoService.setInfo('no_scope', 'catalog');
      dirty = true;
    }
    if (this.selectedType.code === undefined) {
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
        this.selectedType.code,
        this.selectedScope.code,
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

  nodeSelect(event: { node: TreeNode }) {
    if (event.node.children) {
      const parent = event.node;
      event.node.children.map((child: TreeNode) => {
        if (child.parent === undefined) {
          child.parent = parent;
        }
        this.setActiveLayer(child);
      });
    } else {
      this.setActiveLayer(event.node);
    }
  }

  nodeUnselect(event: { node: TreeNode }) {
    if (event.node.children) {
      const parent = event.node;
      event.node.children.map((child: TreeNode) => {
        if (child.parent === undefined) {
          child.parent = parent;
        }
        this.deleteActiveLayer(child);
      });
    } else {
      this.deleteActiveLayer(event.node);
    }
  }

  setCatalog(catalogs: ServicesCatalog) {
    const catalog = this.filesTreeTable.find(catalog => (catalog.title === catalogs.title));
    if (catalog) {
      this.arrSelectedCatalog.push(catalog);
      this.catalogLayersService.arrSelectedCatalog = this.arrSelectedCatalog;
      // this.mapService.selectContexts();
      this.updateRowGroupMetaData();
    }
  }

  deleteCatalog(catalogs: ServicesCatalog) {
    this.arrSelectedCatalog.splice(
      this.arrSelectedCatalog.indexOf(this.arrSelectedCatalog.find(catalog => (catalog.title === catalogs.title))!), 1
    );
    this.catalogLayersService.arrSelectedCatalog = this.arrSelectedCatalog;
    this.updateRowGroupMetaData();
  }

  setActiveLayer(layer: TreeNode) {
    const selCatalog: ServicesCatalog | undefined = layer.parent ? this.arrSelectedCatalog.find(catalog => (catalog.title === layer.parent?.data)) : undefined;
    if (selCatalog) {
      if (selCatalog.type === 'WMTS') {
        selCatalog.activeLayers = new Array<string>();
        this.selectedServices.splice(
          this.selectedServices.indexOf(this.selectedServices.find(node => (node.parent && node.parent.data === selCatalog.title))!), 1
        );
      }
      selCatalog.activeLayers.push(layer.data);
      this.catalogLayersService.arrSelectedCatalog = this.arrSelectedCatalog;
    } else {
      const fndCatalog: ServicesCatalog | undefined = layer.parent ? this.filesTreeTable.find(catalog => (catalog.title === layer.parent?.data)) : undefined;
      if (fndCatalog) {
        fndCatalog.activeLayers = new Array<string>();
        fndCatalog.activeLayers.push(layer.data);
        this.setCatalog(fndCatalog);
      }
    }
  }

  deleteActiveLayer(layer: TreeNode) {
    const selCatalog: ServicesCatalog | undefined = this.arrSelectedCatalog.find(catalog => (catalog.title === layer.parent?.data));
    if (selCatalog) {
      const layerIndex = selCatalog.activeLayers.indexOf(selCatalog.activeLayers.find(lyr => (lyr === layer.data))!);
      if (layerIndex !== -1) {
        selCatalog.activeLayers.splice(layerIndex, 1);
      }
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
              child.children?.forEach(lyr => {
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

  addLayerFromCatalog() {
    this.addLayersFromCatalog(true);
  }
}