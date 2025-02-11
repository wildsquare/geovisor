import { Deserializable } from '../deserializable.model';
import { Parcel } from './parcel.model';

export class Project implements Deserializable {
    name!: string;
    title!: string;
    type!: string;
    goals!: string;
    operations!: string;
    parcels: Parcel[] = new Array<Parcel>();

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}
