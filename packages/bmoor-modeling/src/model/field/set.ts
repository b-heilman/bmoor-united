import {explode} from '@bmoor/object';
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
			rtn.push(key + ': ' + value);
		}
	}

	const tabs = '\t'.repeat(depth);

	return '{\n\t' + tabs + rtn.join(',\n\t' + tabs) + '\n' + tabs + '}';
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
				const toMap = field.toTypescript();

				Object.keys(toMap).map((key) => {
					const base = toMap[key];

					Object.keys(base).map((type) => {
						agg[key][type].push(base[type]);
					});
				});

				return agg;
			},
			{
				external: {
					read: [],
					reference: [],
					create: [],
					update: [],
					search: []
				},
				internal: {
					read: [],
					reference: [],
					create: [],
					update: [],
					search: []
				}
			}
		);

		return {
			external: {
				read: typescriptify(res.external.read),
				reference: typescriptify(res.external.reference),
				create: typescriptify(res.external.create),
				update: typescriptify(res.external.update),
				search: typescriptify(res.external.search)
			},
			internal: {
				read: typescriptify(res.internal.read),
				reference: typescriptify(res.internal.reference),
				create: typescriptify(res.internal.create),
				update: typescriptify(res.internal.update),
				search: typescriptify(res.internal.search)
			}
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
