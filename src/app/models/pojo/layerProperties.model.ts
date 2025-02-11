import { Deserializable } from '../deserializable.model';

export class LayerProperties implements Deserializable {
    name!: string;
    title!: string;
    url!: string;
    type!: string;
    opacity!: number;
    capabilities: any;
    infoFeature!: boolean;
    visible!: boolean;
    visibleToc!: boolean;
    queryable!: boolean;
    legend: any;
    metadata: any;
    last!: boolean;
    first!: boolean;
    disabled!: boolean;

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}
