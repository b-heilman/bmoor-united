import {ContextSecurityInterface} from '@bmoor/context';
import {Mapping} from '@bmoor/path';

import {
	InternalDatum,
	ExternalDatum,
	SearchDatum,
	ModelKey
} from './datum.interface';
import {
	ModelSettings,
	ModelInterface,
	ModelActions
} from './model.interface';
import {ModelFieldInterface} from './model/field.interface';

function actionExtend(old, action) {
	if (old) {
		return function (datum, ctx) {
			return action(old(datum, ctx), ctx);
		};
	} else {
		return action;
	}
}

function buildActions<External, Delta>(
	actions: ModelActions<External, Delta>,
	field: ModelFieldInterface
): void {
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

export class Model<External, Delta, Internal>
	implements ModelInterface<External, Delta, Internal>
{
	fields: Map<string, ModelFieldInterface>;
	settings: ModelSettings<External, Delta, Internal>;
	actions: ModelActions<External, Delta>;
	deflate: Mapping;
	inflate: Mapping;

	constructor(settings: ModelSettings<External, Delta, Internal>) {
		this.settings = settings;
		this.fields = new Map<string, ModelFieldInterface>();
		this.actions = {};

		settings.fields.map((field) => {
			this.fields.set(field.settings.external, field);

			buildActions<External, Delta>(this.actions, field);
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
		content: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]> {
		if (this.settings.validator) {
			// TODO: I need the concept of a compound error
			const error = this.settings.validator.validateCreate(content);

			if (error) {
				throw error;
			}
		}

		// TODO: apply actions

		return this.convertToExternal(
			await this.settings.adapter.create(
				this.convertToInternal(
					await this.settings.controller.canCreate(content, ctx)
				)
			)
		);
	}

	async read(
		ids: ModelKey[],
		ctx: ContextSecurityInterface
	): Promise<External[]> {
		return this.settings.controller.canRead(
			this.convertToExternal(await this.settings.adapter.read(ids)),
			this.settings.accessor.getExternalKey,
			ctx
		);
	}

	async update(
		content: Delta[],
		ctx: ContextSecurityInterface
	): Promise<External[]> {
		if (this.settings.validator) {
			// TODO: I need the concept of a compound error
			const error = this.settings.validator.validateUpdate(
				content,
				this.settings.accessor.getDeltaKey
			);

			if (error) {
				throw error;
			}
		}

		return this.convertToExternal(
			await this.settings.adapter.update(
				this.convertToInternal(
					await this.settings.controller.canUpdate(
						content,
						this.settings.accessor.getDeltaKey,
						ctx
					)
				),
				this.settings.accessor.getDeltaKey
			)
		);
	}

	async delete(
		ids: ModelKey[],
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]> {
		// TODO: can I simplify this?
		// you can only delete that which you can access
		const datums = await this.read(ids, ctx);
		const count = await this.settings.adapter.delete(
			this.convertToInternal(datums)
		);

		if (count !== datums.length) {
			// TODO: do i care?
		}

		return datums;
	}

	async search(
		search: SearchDatum,
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]> {
		return this.settings.controller.canRead(
			this.convertToExternal(await this.settings.adapter.search(search)),
			this.settings.accessor.getExternalKey,
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
