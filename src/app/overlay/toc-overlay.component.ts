import { Component } from '@angular/core';
import { TocMenuComponent } from "../menu/toc-menu.component";
@Component({
  selector: 'app-toc-overlay',
  standalone: true,
  templateUrl: './toc-overlay.component.html',
  styleUrls: ['./toc-overlay.component.css'],
  imports: [TocMenuComponent]
})
export class TocOverlayComponent {

}
