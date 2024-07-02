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
		const internal = content.map((datum) =>
			this.model.onCreate(this.model.fromInflated(datum)),
		);

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
			internal,
			this,
		);

		const rtn = await this.settings.adapter.create(
			allowed.map((datum) => this.model.deflate(datum)),
		);

		return rtn.map((datum) => this.model.fromDeflated(datum));
	}

	async externalCreate(
		ctx: ContextSecurityInterface,
		content: ExternalT['structure'][],
	): Promise<ExternalT['structure'][]> {
		const internal = content.map((datum) => {
			const rtn = this.model.fromInflated(datum);

			return this.model.onCreate(rtn);
		});

		const rtn = await this.create(ctx, internal);

		return rtn.map((datum) => this.model.inflate(datum));
	}

	async read(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]> {
		const res = await this.settings.adapter.read(
			ids.map((datum) => this.model.deflate(datum)),
		);

		return this.settings.controller.canRead(
			ctx,
			res.map((datum) =>
				this.model.onRead(this.model.fromDeflated(datum)),
			),
			this,
		);
	}

	async externalRead(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]> {
		return (
			await this.read(
				ctx,
				ids.map((datum) => this.model.fromInflated(datum)),
			)
		).map((datum) => this.model.inflate(datum));
	}

	async update(
		ctx: ContextSecurityInterface,
		content: ServiceUpdateDelta<InternalT>[],
	): Promise<InternalT['structure'][]> {
		content = await this.settings.controller.canUpdate(
			ctx,
			content.map((change) => {
				change.delta = this.model.onUpdate(change.delta);

				return change;
			}),
			this,
		);

		const validations = (
			await Promise.all(
				content.map(({delta}) => this.model.validate(delta, 'update')),
			)
		).flat();

		if (validations.length) {
			// TODO: How to report all the errors?
			throw new Error(validations[0]);
		}

		const rtn = await this.settings.adapter.update(
			content.map(({ref, delta}) => ({
				ref: this.model.deflate(ref),
				delta: this.model.deflate(delta),
			})),
		);

		return rtn.map((datum) => this.model.fromDeflated(datum));
	}

	async externalUpdate(
		ctx: ContextSecurityInterface,
		content: ServiceUpdateDelta<ExternalT>[],
	): Promise<ExternalT['structure'][]> {
		return (
			await this.update(
				ctx,
				content.map(({ref, delta}) => ({
					ref: this.model.fromInflated(ref),
					delta: this.model.fromInflated(delta),
				})),
			)
		).map((datum) => this.model.inflate(datum));
	}

	async delete(
		ctx: ContextSecurityInterface,
		ids: InternalT['reference'][],
	): Promise<InternalT['structure'][]> {
		const filtered = await this.settings.controller.canDelete(
			ctx,
			ids,
			this,
		);
		const datums = await this.read(ctx, filtered);

		const count = await this.settings.adapter.delete(
			filtered.map((ref) => this.model.deflate(ref)),
		);

		if (count !== datums.length) {
			// TODO: do i care?
		}

		return datums;
	}

	async externalDelete(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]> {
		return (
			await this.delete(
				ctx,
				ids.map((datum) => this.model.fromInflated(datum)),
			)
		).map((datum) => this.model.inflate(datum));
	}

	async search(
		ctx: ContextSecurityInterface,
		search: InternalT['search'],
	): Promise<InternalT['structure'][]> {
		const res = await this.settings.adapter.search(
			this.model.deflate(search),
		);

		return this.settings.controller.canRead(
			ctx,
			res.map((datum) =>
				this.model.onRead(this.model.fromDeflated(datum)),
			),
			this,
		);
	}

	async externalSearch(
		ctx: ContextSecurityInterface,
		search: ExternalT['search'],
	): Promise<ExternalT['structure'][]> {
		return (await this.search(ctx, this.model.fromInflated(search))).map(
			(datum) => this.model.inflate(datum),
		);
	}

	getQueryParams(): Record<string, TypingReference> {
		return {};
	}

	getModel(): ModelInterface<InternalT, ExternalT, StorageT> {
		return this.model;
	}
}
