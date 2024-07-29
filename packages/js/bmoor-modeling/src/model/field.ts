import {Field} from '@bmoor/schema';

import {
	ModelFieldInfo,
	ModelFieldInterface,
	ModelFieldJSON,
} from './field.interface';

export class ModelField extends Field implements ModelFieldInterface {
	constructor(schema: ModelFieldJSON) {
		super(schema);
	}

	getInfo(): ModelFieldInfo {
		return this.source.info;
	}
}
