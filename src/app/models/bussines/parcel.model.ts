import { Feature } from 'ol';
import { Deserializable } from '../deserializable.model';

export class Parcel implements Deserializable {
    name!: string;
    title!: string;
    type!: string;
    feature!: Feature;
    area!: number;
    infoFeature!: boolean;
    projectTitle!: string;
    visible!: boolean;

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}
