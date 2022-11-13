import {Mapping} from '@bmoor/path';

import {ModelFieldInterface} from './model/field.interface';
import {ModelFieldSet} from './model/field/set';

export interface ModelSettings {
	ref: string;
	fields: ModelFieldSet;
}

export interface ModelInterface {
	fields: Map<string, ModelFieldInterface>;
	settings: ModelSettings;
	deflate: Mapping;
	inflate: Mapping;

	getByPath(path: string): ModelFieldInterface;
	toTypescript(): string;
}
