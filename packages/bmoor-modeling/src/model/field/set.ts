import {explode} from '@bmoor/object';
import {info} from 'console';
import {ModelField} from '../field';

import {
	ModelFieldTypescriptInfo,
	ModelFieldInterface,
	ModelFieldSettings
} from '../field.interface';
import {ModelFieldSetTypescript} from './set.interface';

function dumpObject(obj, depth = 0) {
	const rtn = [];

	for (const key in obj) {
		const value = obj[key];

		if (typeof value === 'object') {
			rtn.push(key + ': ' + dumpObject(value, depth + 1));
		} else {
			rtn.push(key + ': ' + value + ';');
		}
	}

	const tabs = '\t'.repeat(depth);

	return '{\n\t' + tabs + rtn.join('\n\t' + tabs) + '\n' + tabs + '}';
}

function typescriptify(infos: ModelFieldTypescriptInfo[]): string {
	const style = explode(
		infos.reduce((agg, info) => {
			agg[info.path] = info.format;

			return agg;
		}, {})
	);

	return dumpObject(style);
}

export class ModelFieldSet extends Array {
	constructor(...fields: ModelFieldInterface[]) {
		super();

		fields.forEach((field) => this.push(field));
	}

	toTypescript(): ModelFieldSetTypescript {
		const res = this.reduce(
			(agg, field) => {
				const {internal, reference, delta, search, external} =
					field.toTypescript();

				agg.external.push(external);

				if (reference) {
					agg.reference.push(reference);
				}

				if (delta) {
					agg.delta.push(delta);
				}

				if (search) {
					agg.search.push(search);
				}

				agg.internal.push(internal);

				return agg;
			},
			{
				external: [],
				reference: [],
				delta: [],
				search: [],
				internal: []
			}
		);

		return {
			external: typescriptify(res.external),
			reference: typescriptify(res.reference),
			delta: typescriptify(res.delta),
			search: typescriptify(res.search),
			internal: typescriptify(res.internal)
		};
	}
}

export function factory(...settings: ModelFieldSettings[]): ModelFieldSet {
	return new ModelFieldSet(
		...settings.map(
			(fieldSettings: ModelFieldSettings) => new ModelField(fieldSettings)
		)
	);
}
