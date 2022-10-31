import {Mapping} from '@bmoor/path';
import {toProperCase} from '@bmoor/string';

import {ModelSettings, ModelInterface} from './model.interface';
import {ModelFieldInterface} from './model/field.interface';

/***
 * A Model is all about the data's structure.  Actions to be performed against the model will
 * be in the service.
 ***/
export class Model implements ModelInterface {
	fields: Map<string, ModelFieldInterface>;
	settings: ModelSettings;

	deflate: Mapping;
	inflate: Mapping;

	constructor(settings: ModelSettings) {
		this.settings = settings;
		this.fields = new Map<string, ModelFieldInterface>();

		settings.fields.map((field) => {
			this.fields.set(field.settings.external, field);
		});

		/***
		 * I am building more efficient accessors that
		 * work together rather than each field doing the
		 * full path of access.  It also allows me to support
		 * arrays
		 ***/
		// TODO: isFlat support
		const toInternal = settings.fields.map((field) => {
			return {
				from: field.settings.external,
				to: field.settings.storage
			};
		});

		const toExternal = settings.fields.map((field) => {
			return {
				from: field.settings.internal,
				to: field.settings.external
			};
		});

		this.deflate = new Mapping(toInternal);
		this.inflate = new Mapping(toExternal);
	}

	getByPath(external: string) {
		return this.fields.get(external);
	}

	toTypescript(): string {
		const res = this.settings.fields.toTypescript();

		return Object.keys(res)
			.flatMap((key) => {
				const group = toProperCase(key);
				return Object.keys(res[key]).map(
					(usage) =>
						'export interface ' +
						group +
						toProperCase(usage) +
						res[key][usage]
				);
			})
			.join('\n');
	}
}
