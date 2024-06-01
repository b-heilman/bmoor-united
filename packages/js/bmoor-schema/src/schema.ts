import { Path } from '@bmoor/path';

import { FieldInterface } from './field.interface';
import {SchemaInterface, SchemaJSON} from './schema.interface';
import { Field } from './field';

export class Schema implements SchemaInterface {
    fields: FieldInterface[];

    constructor(schema: SchemaJSON){
        this.fields = schema.fields.map(
            fieldSchema => new Field(fieldSchema)
        )
    }

    getFields(): FieldInterface[] {
        return this.fields;
    }
}
