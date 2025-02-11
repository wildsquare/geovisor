import { Injectable } from '@angular/core';
import { Parcel } from '../../models/bussines/parcel.model';

@Injectable({
  providedIn: 'root'
})
export class ParcelsService {

  demoParcels: Parcel [] = [];

  constructor() { }
}
