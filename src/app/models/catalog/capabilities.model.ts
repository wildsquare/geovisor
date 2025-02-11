import { Deserializable } from '../deserializable.model';


export class Capabilities implements Deserializable {
    capabilities: any;

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}
