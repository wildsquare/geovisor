import { Injectable } from '@angular/core';
import { Project } from '../../models/bussines/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  demoProjects!: Project[];

  constructor() {
    this.demoProjects = [
      new Project().deserialize({
        name: 'Biodiversidad',
        title: 'Biodiversidad Guadalquitón',
        type: 'Biodiversidad',
        goals: 'goals1',
        operations: 'operations1',
        parcels: []
      }),
      new Project().deserialize({
        name: 'Solar',
        title: 'Granja Placas Solares',
        type: 'Energía Solar',
        goals: 'goals2',
        operations: 'operations2',
        parcels: []
      })
    ];

   }
}
