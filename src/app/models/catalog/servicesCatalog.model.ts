import { Deserializable } from '../deserializable.model';
import { Capabilities } from './capabilities.model';


export class ServicesCatalog implements Deserializable {
    title: string;
    url: string;
    type: string;
    scope: string;
    capabilities: any;
    activeLayers: string[];

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}
