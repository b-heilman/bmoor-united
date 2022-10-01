import {makeGetter} from '@bmoor/object';
import {ContextSecurityInterface} from '@bmoor/context';
import {Mapping} from '@bmoor/path';

import {InternalDatum, ExternalDatum, SearchDatum} from './datum.interface';
import {ModelSettings, ModelInterface, ModelActions} from './model.interface';
import {
	ModelFieldInterface,
	ModelFieldContext,
	ModelFieldSettings
} from './model/field.interface';

function actionExtend(old, action) {
	if (old) {
		return function (datum, ctx) {
			return action(old(datum, ctx), ctx);
		};
	} else {
		return action;
	}
}

function buildActions(
	actions: ModelActions,
	field: ModelFieldInterface
): void {
	const settings: ModelFieldSettings = field.settings;

	if (field.actions.create) {
		actions.create = actionExtend(actions.create, field.actions.create);
	}

	if (field.actions.read) {
		actions.read = actionExtend(actions.read, field.actions.read);
	}

	if (field.actions.update) {
		actions.update = actionExtend(actions.update, field.actions.update);
	}

	if (field.actions.delete) {
		actions.delete = actionExtend(actions.delete, field.actions.delete);
	}

	// inflate are changes out of the database
	if (field.actions.inflate) {
		actions.inflate = actionExtend(actions.inflate, field.actions.inflate);
	}

	// deflate are changes into the database
	if (field.actions.deflate) {
		actions.deflate = actionExtend(actions.deflate, field.actions.deflate);
	}
}

export class Model<External, Internal>
	implements ModelInterface<External, Internal>
{
	fields: Map<string, ModelFieldInterface>;
	settings: ModelSettings<External, Internal>;
	actions: ModelActions;
	deflate: Mapping;
	inflate: Mapping;

	constructor(settings: ModelSettings<External, Internal>) {
		this.settings = settings;
		this.fields = new Map<string, ModelFieldInterface>();
		this.actions = {};

		settings.fields.map((field) => {
			this.fields.set(field.settings.external, field);

			buildActions(this.actions, field);
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

		// TODO: onInflate and onDeflate support
		this.deflate = new Mapping(toInternal);
		this.inflate = new Mapping(toExternal);
	}

	async create(
		content: ExternalDatum[],
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]> {
		return this.convertToExternal(
			await this.settings.adapter.create(
				this.convertToInternal(
					await this.settings.controller.canCreate(content, ctx)
				)
			)
		);
	}

	async read(
		ids: string[],
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]> {
		return this.settings.controller.canRead(
			this.convertToExternal(await this.settings.adapter.read(ids)),
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
			this.settings.controller.canUpdate(datums, ctx),
			this.read(ids, ctx)
		]);

		const converted = this.convertToInternal(datums);
		const res = this.settings.adapter.update(
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
			await this.settings.adapter.delete(
				this.convertToInternal(await this.read(ids, ctx))
			)
		);
	}

	async search(
		search: SearchDatum,
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]> {
		return this.settings.controller.canRead(
			this.convertToExternal(await this.settings.adapter.search(search)),
			ctx
		);
	}

	getByPath(external: string) {
		return this.fields.get(external);
	}

	convertToInternal(
		content: ExternalDatum[],
		ctx?: ContextSecurityInterface
	): InternalDatum[] {
		return content.map((datum) => {
			if (this.actions.deflate) {
				this.actions.deflate(datum, ctx);
			}

			return this.deflate.transform(datum);
		});
	}

	convertToExternal(
		content: InternalDatum[],
		ctx?: ContextSecurityInterface
	): ExternalDatum[] {
		return content.map((datum) => {
			const rtn = this.inflate.transform(datum);

			if (this.actions.inflate) {
				this.actions.inflate(rtn, ctx);
			}

			return rtn;
		});
	}
}
