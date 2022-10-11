import {ContextSecurityInterface} from '@bmoor/context';
import {Mapping} from '@bmoor/path';

import {
	ModelUpdate
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

function buildActions<
	ExternalRead,
	ExternalReference,
	ExternalCreate,
	ExternalUpdate,
	ExternalSearch
>(
	actions: ModelActions<
		ExternalRead,
		ExternalReference,
		ExternalCreate,
		ExternalUpdate,
		ExternalSearch
	>,
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

	// inflate are changes out of the database
	if (field.actions.inflate) {
		actions.inflate = actionExtend(actions.inflate, field.actions.inflate);
	}

	// deflate are changes into the database
	if (field.actions.deflate) {
		actions.deflate = actionExtend(actions.deflate, field.actions.deflate);
	}
}

export class Model<
	ExternalRead,
	ExternalReference,
	ExternalCreate,
	ExternalUpdate,
	ExternalSearch,
	InternalRead,
	InternalReference,
	InternalCreate,
	InternalUpdate,
	InternalSearch
> implements
		ModelInterface<
			ExternalRead,
			ExternalReference,
			ExternalCreate,
			ExternalUpdate,
			ExternalSearch,
			InternalRead,
			InternalReference, // TODO: can I drop these internals to constants here?
			InternalCreate,
			InternalUpdate,
			InternalSearch
		>
{
	fields: Map<string, ModelFieldInterface>;
	settings: ModelSettings<
		ExternalRead,
		ExternalReference,
		ExternalCreate,
		ExternalUpdate,
		InternalRead,
		InternalReference,
		InternalCreate,
		InternalUpdate,
		InternalSearch
	>;
	actions: ModelActions<
		ExternalRead,
		ExternalReference,
		ExternalCreate,
		ExternalUpdate,
		ExternalSearch
	>;
	deflate: Mapping;
	inflate: Mapping;

	constructor(
		settings: ModelSettings<
			ExternalRead,
			ExternalReference,
			ExternalCreate,
			ExternalUpdate,
			InternalRead,
			InternalReference,
			InternalCreate,
			InternalUpdate,
			InternalSearch
		>
	) {
		this.settings = settings;
		this.fields = new Map<string, ModelFieldInterface>();
		this.actions = {};

		settings.fields.map((field) => {
			this.fields.set(field.settings.external, field);

			buildActions<
				ExternalRead,
				ExternalReference,
				ExternalCreate,
				ExternalUpdate,
				ExternalSearch
			>(this.actions, field);
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
		content: ExternalCreate[],
		ctx: ContextSecurityInterface
	): Promise<ExternalRead[]> {
		if (this.actions.create) {
			content.map((datum) => this.actions.create(datum, ctx));
		}

		if (this.settings.validator?.validateCreate) {
			// TODO: I need the concept of a compound error
			const error = await this.settings.validator.validateCreate(content);

			if (error) {
				throw error;
			}
		}

		const allowed = await this.settings.controller.canCreate(content, ctx);

		const rtn = await this.settings.adapter.create(
			<InternalCreate[]>allowed.map(
				datum => this.convertToInternal(datum, ctx)
			)
		);

		return rtn.map(datum => this.convertToExternal(datum, ctx));
	}

	async read(
		ids: ExternalReference[],
		ctx: ContextSecurityInterface
	): Promise<ExternalRead[]> {
		const res = await this.settings.adapter.read(
			<InternalReference[]>ids.map(
				ref => this.convertToInternal(ref, ctx)
			)
		);

		const rtn = await this.settings.controller.canRead(
			res.map(datum => this.convertToExternal(datum, ctx)),
			this.settings.accessor.getExternalKey,
			ctx
		);

		if (this.actions.read) {
			rtn.map((datum) => this.actions.read(datum, ctx));
		}

		return rtn;
	}

	async update(
		content: ModelUpdate<ExternalReference, ExternalUpdate>[],
		ctx: ContextSecurityInterface
	): Promise<ExternalRead[]> {
		if (this.actions.update) {
			content.map((delta) => this.actions.update(delta, ctx));
		}

		if (this.settings.validator?.validateUpdate) {
			// TODO: I need the concept of a compound error
			const error = await this.settings.validator.validateUpdate(content);

			if (error) {
				throw error;
			}
		}

		const send = await this.settings.controller.canUpdate(content, ctx);
		const converted: ModelUpdate<InternalReference, InternalUpdate>[] = send.map(
			change => ({
				ref: <InternalReference>this.convertToInternal(change.ref, ctx),
				delta: <InternalUpdate>this.convertToInternal(change.delta, ctx)
			})
		);

		const rtn = await this.settings.adapter.update(converted);

		return rtn.map(datum => this.convertToExternal(datum, ctx));
	}

	async delete(
		ids: ExternalReference[],
		ctx: ContextSecurityInterface
	): Promise<ExternalRead[]> {
		// TODO: canDelete
		
		const datums = await this.read(ids, ctx);

		const count = await this.settings.adapter.delete(
			<InternalReference[]>ids.map(
				ref => this.convertToInternal(ref, ctx)
			)
		);

		if (count !== datums.length) {
			// TODO: do i care?
		}

		return datums;
	}

	async search(
		search: ExternalSearch,
		ctx: ContextSecurityInterface
	): Promise<ExternalRead[]> {
		const res = await this.settings.adapter.search(
			<InternalSearch>this.convertToInternal(search, ctx)
		);

		const rtn = await this.settings.controller.canRead(
			res.map(datum => this.convertToExternal(datum, ctx)),
			this.settings.accessor.getExternalKey,
			ctx
		);

		if (this.actions.read) {
			rtn.map((datum) => this.actions.read(datum, ctx));
		}

		return rtn;
	}

	getByPath(external: string) {
		return this.fields.get(external);
	}

	convertToInternal(
		datum: ExternalReference | ExternalCreate | ExternalCreate | ExternalUpdate | ExternalSearch,
		ctx: ContextSecurityInterface
	): InternalReference | InternalCreate | InternalUpdate | InternalSearch{
		if (this.actions.deflate) {
			this.actions.deflate(datum, ctx);
		}

		return this.deflate.transform(datum);
	}

	convertToExternal(
		datum: InternalRead,
		ctx: ContextSecurityInterface
	): ExternalRead {
		const rtn = this.inflate.transform(datum);

		if (this.actions.inflate) {
			this.actions.inflate(rtn, ctx);
		}

		return rtn;
	}

	toTypescript() {
		return this.settings.fields.toTypescript();
	}
}
