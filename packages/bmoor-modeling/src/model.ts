
import {makeGetter} from '@bmoor/object';
import {ContextSecurityInterface} from '@bmoor/context';
import {Mapping} from '@bmoor/path';

import {
	InternalDatum,
	ExternalDatum,
	SearchDatum,
	ModelSettings,
	ModelInterface,
	ModelActions
} from './model.interface';

import {
	ModelFieldInterface,
	ModelFieldContext,
	ModelFieldSettings
} from './model/field.interface';

function actionExtend(old, op, getter, setter, fieldCtx: ModelFieldContext) {
	if (old) {
		return function (datum, ctx) {
			op(old(datum, ctx), setter, getter, fieldCtx, ctx);

			return datum;
		};
	} else {
		return function (datum, ctx) {
			op(datum, setter, getter, fieldCtx, ctx);

			return datum;
		};
	}
}

function buildActions(
	actions: ModelActions, 
	field: ModelFieldInterface
): void {
	const settings: ModelFieldSettings = field.settings;

	let ctx: ModelFieldContext = {};

	if (settings.config) {
		const cfg = settings.config;
		// this is to allow one field type to watch another field type
		if (cfg.target) {
			ctx.getTarget = makeGetter(cfg.target);
		}
	}

	if (settings.onCreate) {
		actions.create = actionExtend(
			actions.create,
			settings.onCreate,
			field.externalGetter,
			field.externalSetter,
			ctx
		);
	}

	if (settings.onUpdate) {
		actions.update = actionExtend(
			actions.update,
			settings.onUpdate,
			field.externalGetter,
			field.externalSetter,
			ctx
		);
	}

	// inflate are changes out of the database
	if (settings.onInflate) {
		actions.inflate = actionExtend(
			actions.inflate,
			settings.onInflate,
			field.externalGetter,
			field.externalSetter,
			ctx
		);
	}

	// deflate are changes into the database
	if (settings.onDeflate) {
		actions.deflate = actionExtend(
			actions.deflate,
			settings.onDeflate,
			field.externalGetter,
			field.externalSetter,
			ctx
		);
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

	convertToInternal(content: ExternalDatum[]): InternalDatum[] {
		return content.map((datum) => {
			if (this.actions.deflate){
				this.actions.deflate(datum);
			}

			return this.deflate.transform(datum);
		});
	}

	convertToExternal(content: InternalDatum[]): ExternalDatum[] {
		return content.map((datum) => {
			const rtn = this.inflate.transform(datum);

			if (this.actions.inflate){
				this.actions.inflate(rtn);
			}

			return rtn;
		});
	}
}
