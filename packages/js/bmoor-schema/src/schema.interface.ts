import {DynamicObject} from '@bmoor/object';

import {FieldInfo, FieldInterface, FieldJSON, FieldParsed} from './field.interface';

export interface SchemaStructured {
	structure: DynamicObject<string>;
	info: Record<string, FieldInfo>;
}

export interface SchemaJSON {
	fields: FieldJSON[];
}

export interface SchemaParsed {
	fields: FieldParsed[];
}

export interface SchemaInterface {
	getFields(): FieldInterface[];
}
