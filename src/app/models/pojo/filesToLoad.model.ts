import { Deserializable } from '../deserializable.model';


export class FilesToLoad implements Deserializable {
    file!: File;
    extension!: string;

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}
