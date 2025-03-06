import { Component } from '@angular/core';
import { Project } from '../models/bussines/project.model';
import { ProjectsService } from '../services/bussines/projects.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { Feature } from 'ol';
import { UtilsService } from '../services/core/utils.service';

@Component({
  selector: 'app-projects',
  imports: [TableModule, ScrollPanelModule, CommonModule, ButtonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {

  projects: Project[] = [];
  cols: any[] = [];

  constructor(
    private projectsService: ProjectsService,
    private utilsService: UtilsService
  ) {}

  ngOnInit() {
    this.projects = this.projectsService.demoProjects;
    
    this.cols = [
        { field: 'name', header: 'Nombre' },
        { field: 'title', header: 'Título' }
    ];
  }

  onRowSelect(event: { originalEvent: Event, data: Project, index: number }) {
      const arrFeatures = new Array<Feature>();
      event.data.parcels.map(parcel=> {
        arrFeatures.push(parcel.feature);
      });
      this.utilsService.centerToExtentFeatures(arrFeatures, this.utilsService.epsg);
  }

}