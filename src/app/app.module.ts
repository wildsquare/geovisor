import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { SidebarModule } from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TreeModule } from 'primeng/tree';
import { DropdownModule } from 'primeng/dropdown';
import { DockModule } from 'primeng/dock';
import { SliderModule } from 'primeng/slider';
import { TocComponent } from './toc/toc.component';
import { TocMenuComponent } from './menu/toc-menu.component';
import { TocOverlayComponent } from './overlay/toc-overlay.component';
import { CatalogComponent } from './toc/catalog.component';
import { MapComponent } from './map/map.component';

export function initializeApp(): () => Promise<void> {
  return (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Initialization logic here
      resolve();
    });
  };
}

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, OverlayModule,
    SidebarModule, TableModule, ScrollPanelModule, PanelModule, CheckboxModule, ButtonModule,
    TreeModule, DropdownModule, DockModule, SliderModule
  ],
  providers: [
    {
        provide: APP_INITIALIZER,
        useFactory: initializeApp,
        deps: [],
        multi: true
    }
],
})
export class AppModule { }