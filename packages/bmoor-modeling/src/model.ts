import {ContextSecurityInterface} from '@bmoor/context';
import {urlToHttpOptions} from 'url';

import {
	InternalDatum,
	ExternalDatum,
	SearchDatum,
	ModelSecurity,
	ModelAccessors,
	ModelSettings,
	ModelInterface
} from './model.interface';

import {ModelFieldInterface} from './model/field.interface';

export class Model implements ModelInterface {
	fields: Map<string, ModelFieldInterface>;
	incomingSettings: ModelSettings;

	constructor(settings: ModelSettings) {
		this.incomingSettings = settings;

		settings.fields.map((field) => {
			this.fields.set(field.settings.external, field);
		});
	}

	create(
		content: ExternalDatum[],
		ctx: ContextSecurityInterface
	): ExternalDatum[] {
		return this.internalToExternal(
			this.incomingSettings.accessors.create(
				this.externalToInternal(
					this.incomingSettings.security.validateCreate(content, ctx)
				)
			)
		);
	}

	read(ids: string[], ctx: ContextSecurityInterface): ExternalDatum[] {
		return this.incomingSettings.security.secure(
			this.internalToExternal(this.incomingSettings.accessors.read(ids)),
			ctx
		);
	}

	update(
		content: Record<string, ExternalDatum>,
		ctx: ContextSecurityInterface
	): Record<string, ExternalDatum> {
		const datums = [];
		const ids = [];
		for (const key in content) {
			datums.push(content[key]);
			ids.push(key);
		}

		Promise.all([
			this.incomingSettings.security.validateUpdate(datums, ctx),
			this.read(ids, ctx)
		]);

		const converted = this.externalToInternal(datums);
		const res = this.incomingSettings.accessors.update(
			ids.reduce((agg, key, i) => {
				agg[key] = converted[i];

				return agg;
			}, {})
		);

		const rtn = this.internalToExternal(Object.values(res));

		return Object.keys(rtn).reduce((agg, key, i) => {
			agg[key] = rtn[i];

			return agg;
		}, {});
	}

	delete(ids: string[], ctx: ContextSecurityInterface): ExternalDatum[] {
		// TODO: can I simplify this?
		// you can only delete that which you can access
		return this.internalToExternal(
			this.incomingSettings.accessors.delete(
				this.externalToInternal(this.read(ids, ctx))
			)
		);
	}

	search(search: SearchDatum, ctx: ContextSecurityInterface): ExternalDatum[] {
		return this.incomingSettings.security.secure(
			this.internalToExternal(this.incomingSettings.accessors.search(search)),
			ctx
		);
	}

	getByPath(external: string) {
		return this.fields.get(external);
	}

	externalToInternal(content: ExternalDatum[]): InternalDatum[] {
		// TODO: use path
		return [{}];
	}

	internalToExternal(content: InternalDatum[]): ExternalDatum[] {
		return [{}];
	}
}
