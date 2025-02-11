import { Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TocOverlayComponent } from '../../overlay/toc-overlay.component';
import { Subscription } from 'rxjs';
import { UtilsService } from './utils.service';

interface OverlayConfig {
  rightPanel?: string;
  leftPanel?: string;
  widthPanel?: string;
  heightPanel?: string;
  topPanel?: string;
  bottomPanel?: string;
}



@Injectable({
  providedIn: 'root'
})
export class OverlayService {

  overlaySynopticRef!: OverlayRef;
  overlayCaptchaNoteRef!: OverlayRef;
  overlayDownloadFeaturesRef!: OverlayRef;
  overlayPrincipalMenuRef!: OverlayRef;
  overlaySearcherMenuRef!: OverlayRef;
  overlaySearcherMobileRef!: OverlayRef;
  overlayMapMenuRef!: OverlayRef;
  overlayTocRef!: OverlayRef;
  overlayErrorFeatureRef!: OverlayRef;
  overlayCookieChooseRef!: OverlayRef;

  isDesktop!: boolean;
  actionIsDesktop: Subscription = new Subscription();
  mediaQueryList: any;

  constructor(
    private overlay: Overlay,
    private utilsService: UtilsService
    ) {
     }


  getTocOverlay(config: OverlayConfig = {}) {
    const positionStrategy = this.overlay.position()
      .global()
      .right()
      .top(config.topPanel);
    const configTocOverlay = { height: config.heightPanel, width: config.widthPanel, positionStrategy};
    // Returns an OverlayRef which is a PortalHost
    this.overlayTocRef = this.overlay.create(configTocOverlay);

    // Create ComponentPortal that can be attached to a PortalHost
    const filePreviewPortal = new ComponentPortal(TocOverlayComponent);

    // Attach ComponentPortal to PortalHost
    this.overlayTocRef.attach(filePreviewPortal);
    return this.overlayTocRef;
  }

  hideOverlayTocRef() {
    if (this.overlayTocRef) {
      this.overlayTocRef.dispose();
    }
  }

}
