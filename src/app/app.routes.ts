import { Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: '', component: MapComponent}
];