import {implode} from '@bmoor/object';
import {ModelField} from '../field';

import {ModelFieldInterface, ModelFieldSettings} from '../field.interface';
import {ModelFieldSetTypescript} from './set.interface';

export class ModelFieldSet extends Array {
	constructor(...fields: ModelFieldInterface[]) {
		super();

		fields.forEach((field) => this.push(field));
	}

	toTypescript(): ModelFieldSetTypescript {
		const res = this.reduce(
			(agg, field) => {
				const {internal, external} = field.toTypescript();

				agg.internal[internal.path] = internal.format;
				agg.external[external.path] = external.format;

				return agg;
			},
			{
				internal: {},
				external: {}
			}
		);

		return {
			internal: JSON.stringify(implode(res.internal), null, '\t'),
			external: JSON.stringify(implode(res.external), null, '\t')
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
