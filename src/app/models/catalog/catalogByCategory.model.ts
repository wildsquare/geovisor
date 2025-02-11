import { Deserializable } from '../deserializable.model';

export class CatalogByCategory implements Deserializable {
    key: any;
    catalog!: any[];

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}
