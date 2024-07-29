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

export class Service<
	InternalT extends ServiceInternalGenerics = ServiceInternalGenerics,
	ExternalT extends ServiceExternalGenerics = ServiceExternalGenerics,
	StorageT extends ServiceStorageGenerics = ServiceStorageGenerics,
> implements ServiceInterface<InternalT, ExternalT, StorageT>
{
	hooks: ServiceHooks<InternalT>;
	model: ModelInterface<InternalT, ExternalT, StorageT>;
	settings: ServiceSettings<InternalT, StorageT>;

	constructor(
		model: ModelInterface<InternalT, ExternalT, StorageT>,
		settings: ServiceSettings<InternalT, StorageT>,
		hooks?: ServiceHooks<InternalT>,
	) {
		this.hooks = hooks || {};
		this.model = model;
		this.settings = settings;
	}

	async create(
		ctx: ContextSecurityInterface,
		content: ExternalT['structure'][],
	): Promise<ExternalT['structure'][]> {
		const internal = content.map((datum) =>
			this.onCreate(ctx, this.model.fromInflated(datum)),
		);

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
			allowed.map((datum) => this.deflate(ctx, datum)),
		);

		return rtn.map((datum) => this.model.fromDeflated(datum));
	}

	async externalCreate(
		ctx: ContextSecurityInterface,
		content: ExternalT['structure'][],
	): Promise<ExternalT['structure'][]> {
		const internal = content.map((datum) => {
			const rtn = this.model.fromInflated(datum);

			return this.onCreate(ctx, rtn);
		});

		const rtn = await this.create(ctx, internal);

		return rtn.map((datum) => this.inflate(ctx, datum));
	}

	async read(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]> {
		const res = await this.settings.adapter.read(
			ids.map((datum) => this.deflate(ctx, datum)),
		);

		return this.settings.controller.canRead(
			ctx,
			res.map((datum) => this.onRead(ctx, this.model.fromDeflated(datum))),
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
		).map((datum) => this.inflate(ctx, datum));
	}

	async update(
		ctx: ContextSecurityInterface,
		content: ServiceUpdateDelta<InternalT>[],
	): Promise<InternalT['structure'][]> {
		content = await this.settings.controller.canUpdate(
			ctx,
			content.map((change) => {
				change.delta = this.onUpdate(ctx, change.delta);

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
				ref: this.deflate(ctx, ref),
				delta: this.deflate(ctx, delta),
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
		).map((datum) => this.inflate(ctx, datum));
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
			filtered.map((ref) => this.deflate(ctx, ref)),
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
		).map((datum) => this.inflate(ctx, datum));
	}

	async search(
		ctx: ContextSecurityInterface,
		search: InternalT['search'],
	): Promise<InternalT['structure'][]> {
		const res = await this.settings.adapter.search(
			this.deflate(ctx, search),
		);

		return this.settings.controller.canRead(
			ctx,
			res.map((datum) => this.onRead(ctx, this.model.fromDeflated(datum))),
			this,
		);
	}

	async externalSearch(
		ctx: ContextSecurityInterface,
		search: ExternalT['search'],
	): Promise<ExternalT['structure'][]> {
		return (await this.search(ctx, this.model.fromInflated(search))).map(
			(datum) => this.inflate(ctx, datum),
		);
	}

	getQueryActions(): Record<string, TypingReference> {
		return this.settings.actions || {};
	}

	getModel(): ModelInterface<InternalT, ExternalT, StorageT> {
		return this.model;
	}

	onCreate(
		ctx: ContextSecurityInterface,
		obj: InternalT['structure'],
	): InternalT['structure'] {
		this.model.onCreate(obj);

		if (this.hooks.onCreate) {
			this.hooks.onCreate(ctx, obj);
		}

		return obj;
	}

	onRead(
		ctx: ContextSecurityInterface,
		obj: InternalT['structure'],
	): InternalT['structure'] {
		this.model.onRead(obj);

		if (this.hooks.onRead) {
			this.hooks.onRead(ctx, obj);
		}

		return obj;
	}

	onUpdate(
		ctx: ContextSecurityInterface,
		obj: InternalT['structure'],
	): InternalT['structure'] {
		this.model.onUpdate(obj);

		if (this.hooks.onUpdate) {
			this.hooks.onUpdate(ctx, obj);
		}

		return obj;
	}

	onInflate(
		ctx: ContextSecurityInterface,
		obj: InternalT['structure'],
	): InternalT['structure'] {
		this.model.onInflate(obj);

		if (this.hooks.onInflate) {
			this.hooks.onInflate(ctx, obj);
		}

		return obj;
	}

	inflate(
		ctx: ContextSecurityInterface,
		obj: InternalT['structure'],
	): ExternalT['structure'] {
		this.onInflate(ctx, obj);

		return this.model.inflate(obj);
	}

	onDeflate(
		ctx: ContextSecurityInterface,
		obj: InternalT['structure'],
	): InternalT['structure'] {
		this.model.onDeflate(obj);

		if (this.hooks.onDeflate) {
			this.hooks.onDeflate(ctx, obj);
		}

		return obj;
	}

	deflate(
		ctx: ContextSecurityInterface,
		obj: InternalT['structure'],
	): StorageT['structure'] {
		this.onDeflate(ctx, obj);

		return this.model.deflate(obj);
	}
}
