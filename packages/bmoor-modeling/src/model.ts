import {ContextSecurityInterface} from '@bmoor/context';
import {Mapping} from '@bmoor/path';

import {
	InternalDatum,
	ExternalDatum,
	SearchDatum,
	ModelSettings,
	ModelInterface
} from './model.interface';

import {ModelFieldInterface} from './model/field.interface';

export class Model implements ModelInterface {
	fields: Map<string, ModelFieldInterface>;
	incomingSettings: ModelSettings;
	toInternal: Mapping;
	toExternal: Mapping;

	constructor(settings: ModelSettings) {
		this.incomingSettings = settings;
		this.fields = new Map<string, ModelFieldInterface>();

		const toInternal = settings.fields.map((field) => {
			this.fields.set(field.incomingSettings.external, field);

			return {
				from: field.incomingSettings.external,
				to: field.incomingSettings.internal
			};
		});

		const toExternal = toInternal.map((map) => ({
			to: map.from,
			from: map.to
		}));

		this.toInternal = new Mapping(toInternal);
		this.toExternal = new Mapping(toExternal);
	}

	async create(
		content: ExternalDatum[],
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]> {
		return this.convertToExternal(
			await this.incomingSettings.accessors.create(
				this.convertToInternal(
					this.incomingSettings.security.validateCreate(content, ctx)
				)
			)
		);
	}

	async read(
		ids: string[], 
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]> {
		return this.incomingSettings.security.secure(
			this.convertToExternal(
				await this.incomingSettings.accessors.read(ids)
			),
			ctx
		);
	}

	async update(
		content: Record<string, ExternalDatum>,
		ctx: ContextSecurityInterface
	): Promise<Record<string, ExternalDatum>> {
		const datums = [];
		const ids = [];
		for (const key in content) {
			datums.push(content[key]);
			ids.push(key);
		}

		await Promise.all([
			this.incomingSettings.security.validateUpdate(datums, ctx),
			this.read(ids, ctx)
		]);

		const converted = this.convertToInternal(datums);
		const res = this.incomingSettings.accessors.update(
			ids.reduce((agg, key, i) => {
				agg[key] = converted[i];

				return agg;
			}, {})
		);

		const rtn = this.convertToExternal(Object.values(res));

		return Object.keys(rtn).reduce((agg, key, i) => {
			agg[key] = rtn[i];

			return agg;
		}, {});
	}

	async delete(
		ids: string[], 
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]> {
		// TODO: can I simplify this?
		// you can only delete that which you can access
		return this.convertToExternal(
			await this.incomingSettings.accessors.delete(
				this.convertToInternal(await this.read(ids, ctx))
			)
		);
	}

	async search(
		search: SearchDatum, 
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]> {
		return this.incomingSettings.security.secure(
			this.convertToExternal(
				await this.incomingSettings.accessors.search(search)
			),
			ctx
		);
	}

	getByPath(external: string) {
		return this.fields.get(external);
	}

	convertToInternal(content: ExternalDatum[]): InternalDatum[] {
		return content.map((datum) => this.toInternal.transform(datum));
	}

	convertToExternal(content: InternalDatum[]): ExternalDatum[] {
		return content.map((datum) => this.toExternal.transform(datum));
	}
}
