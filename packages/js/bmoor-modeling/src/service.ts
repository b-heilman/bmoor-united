import {ContextSecurityInterface} from '@bmoor/context';
import {TypingReference} from '@bmoor/schema';

import {ModelInterface} from './model.interface';
import {
	ServiceExternalGenerics,
	ServiceHooks,
	ServiceInterface,
	ServiceInternalGenerics,
	ServiceSettings,
	ServiceStorageGenerics,
	ServiceUpdateDelta,
} from './service.interface';

/*
function buildActions<
	SchemaT = SchemaInterface,
	StructureT = StructureType,
	ReferenceT = ReferenceType,
	DeltaT = DeltaType,
	SearchT = SearchType,
	ExternalT = StructureType,
>(
	actions: ServiceActions<
		ExternalT,
		ReferenceT,
		ExternalCreate,
		DeltaT,
		SearchT
	>,
	field: ModelFieldInterface,
): void {
	if (field.actions.onCreate) {
		actions.onCreate = actionExtend(
			actions.onCreate,
			field.actions.onCreate,
		);
	}

	if (field.actions.onRead) {
		actions.onRead = actionExtend(actions.onRead, field.actions.onRead);
	}

	if (field.actions.onUpdate) {
		actions.onUpdate = actionExtend(
			actions.onUpdate,
			field.actions.onUpdate,
		);
	}

	// inflate are changes out of the database
	if (field.actions.onInflate) {
		actions.onInflate = actionExtend(
			actions.onInflate,
			field.actions.onInflate,
		);
	}

	// deflate are changes into the database
	if (field.actions.onDeflate) {
		actions.onDeflate = actionExtend(
			actions.onDeflate,
			field.actions.onDeflate,
		);
	}
}
*/
export class Service<
	InternalT extends ServiceInternalGenerics = ServiceInternalGenerics,
	ExternalT extends ServiceExternalGenerics = ServiceExternalGenerics,
	StorageT extends ServiceStorageGenerics = ServiceStorageGenerics,
> implements ServiceInterface<InternalT, ExternalT, StorageT>
{
	hooks?: ServiceHooks<InternalT>;
	model: ModelInterface<InternalT, ExternalT, StorageT>;
	settings: ServiceSettings<InternalT, StorageT>;

	constructor(
		model: ModelInterface<InternalT, ExternalT, StorageT>,
		settings: ServiceSettings<InternalT, StorageT>,
		hooks?: ServiceHooks<InternalT>,
	) {
		this.hooks = hooks;
		this.model = model;
		this.settings = settings;
	}

	async create(
		ctx: ContextSecurityInterface,
		content: ExternalT['structure'][],
	): Promise<ExternalT['structure'][]> {
		const internal = content.map((datum) => {
			const rtn = this.model.fromInflated(datum);

			this.model.onCreate(rtn);

			return rtn;
		});

		if (this.hooks.onCreate) {
			internal.forEach((datum) => this.hooks.onCreate(ctx, datum));
		}

		const validations = (
			await Promise.all(
				internal.map((datum) => this.model.validate(datum, 'create')),
			)
		).flat();

		if (validations.length) {
			// TODO: How to report all the errors?
			throw new Error(validations[0]);
		}

		const allowed = await this.settings.controller.canCreate(
			ctx,
			content,
			this,
		);

		const rtn = await this.settings.adapter.create(
			allowed.map((datum) => this.model.deflate(datum)),
		);

		return rtn.map((datum) =>
			this.model.inflate(this.model.fromDeflated(datum)),
		);
	}

	async _read(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<InternalT['structure'][]> {
		const stored = await this.settings.adapter.read(
			ids.map((ref) => this.model.deflate(ref)),
		);

		const rtn = await this.settings.controller.canRead(
			ctx,
			stored.map((datum) => this.model.fromDeflated(datum)),
			this,
		);

		if (this.hooks.onRead) {
			rtn.forEach((datum) => this.hooks.onRead(ctx, datum));
		}

		return rtn;
	}

	async read(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]> {
		const rtn = await this._read(ctx, ids);

		return rtn.map((datum) => this.model.inflate(datum));
	}

	async update(
		ctx: ContextSecurityInterface,
		content: ServiceUpdateDelta<ExternalT>[],
	): Promise<ExternalT['structure'][]> {
		const updates = content.map(({ref, delta}) => ({
			ref: this.model.deflate(ref),
			delta: this.model.deflate(delta),
		}));

		if (this.hooks.onUpdate) {
			updates.map(({delta}) => this.hooks.onUpdate(ctx, delta));
		}

		const validations = (
			await Promise.all(
				updates.map(({delta}) => this.model.validate(delta, 'update')),
			)
		).flat();

		if (validations.length) {
			// TODO: How to report all the errors?
			throw new Error(validations[0]);
		}

		const send = await this.settings.controller.canUpdate(
			ctx,
			updates,
			this,
		);
		const rtn = await this.settings.adapter.update(send);

		return rtn.map((datum) =>
			this.model.inflate(this.model.fromDeflated(datum)),
		);
	}

	async delete(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT[]> {
		const toDelete = await this.settings.controller.canDelete(
			ctx,
			await this._read(ctx, ids),
			this,
		);

		const count = await this.settings.adapter.delete(
			// TODO: toReference
			toDelete.map((datum) => this.convertToInternal(ref, ctx)),
		);

		if (count !== toDelete.length) {
			// TODO: do i care?
		}

		return toDelete.map((datum) => this.model.inflate(datum));
	}

	async search(
		ctx: ContextSecurityInterface,
		search: SearchT,
	): Promise<ExternalT[]> {
		const res = await this.settings.adapter.search(
			<InternalSearch>this.convertToInternal(search, ctx),
		);

		const rtn = await this.settings.controller.canRead(
			res.map((datum) => this.convertToExternal(datum, ctx)),
			this.settings.accessor.getExternalKey,
			ctx,
		);

		if (this.actions.read) {
			rtn.map((datum) => this.actions.read(datum, ctx));
		}

		return rtn;
	}

	getQueryParams(): Record<string, TypingReference> {
		return {};
	}

	getModel(): ModelInterface<StructureT, DeltaT, ExternalT> {
		return this.model;
	}
}
