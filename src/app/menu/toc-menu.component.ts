import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ComponentsService } from '../services/core/components.service';
import { TocComponent } from '../toc/toc.component';

@Component({
    selector: 'app-toc-menu',
    templateUrl: './toc-menu.component.html',
    styleUrls: ['./toc-menu.component.css']
})
export class TocMenuComponent implements OnInit {
  @ViewChild('tocMenuDiv', {static: true, read: ViewContainerRef}) tocMenuDiv!: ViewContainerRef;

  constructor(private componentsService: ComponentsService) { }

  ngOnInit() {
      this.componentsService.setTocContainer(this.tocMenuDiv);
      this.setTocComponent();
  }

  setTocComponent() {
      this.componentsService.removeComponents(this.componentsService.tocContainer);
      this.componentsService.addComponent(this.componentsService.tocContainer, TocComponent);
  }
}
