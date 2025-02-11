import { Deserializable } from '../deserializable.model';
import { TreeNode } from 'primeng/api';

export class NodeCatalog implements TreeNode {
    label?: string;
    data?: any;
    expandedIcon?: string;
    collapsedIcon?: string;
    children?: NodeCatalog[];
    leaf?: boolean;
    expanded?: boolean;
    selectable?: boolean;
    type?: string;

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}
