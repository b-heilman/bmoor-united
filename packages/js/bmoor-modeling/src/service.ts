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
import {ServiceAdapterSelector} from './service/adapter.interface';

function getStorageModel(model: ModelInterface) {
	return {
		name: model.getReference(),
		fields: model.getFields().map((field) => ({
			path: field.getStoragePath(),
		})),
	};
}

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
		const model = this.getModel();
		const internal = content.map((datum) => this.onCreate(ctx, datum));

		const validations = (
			await Promise.all(
				internal.map((datum) => this.model.validate(datum, 'create')),
			)
		).flat();

		if (validations.length) {
			// TODO: How to report all the errors?
			throw new Error(validations[0]);
		}

		const allowed = this.settings.controller
			? await this.settings.controller.canCreate(ctx, internal, this)
			: internal;

		const res = await this.settings.adapter.create(ctx, {
			model: getStorageModel(model),
			params: allowed.map((datum) => {
				return model.implodeStorage(this.deflate(ctx, datum));
			}),
		});

		return res.map((datum) =>
			this.onRead(ctx, this.model.fromDeflated(datum)),
		);
	}

	async externalCreate(
		ctx: ContextSecurityInterface,
		content: ExternalT['structure'][],
	): Promise<ExternalT['structure'][]> {
		const internal = content.map((datum) =>
			this.model.fromInflated(datum),
		);

		const rtn = await this.create(ctx, internal);

		return rtn.map((datum) => this.inflate(ctx, datum));
	}

	async read(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]> {
		const model = this.getModel();
		const fields = model.getPrimaryFields();
		const res = await this.settings.adapter.read(ctx, {
			select: {
				models: [getStorageModel(model)],
			},
			params: {
				ops: fields.map((field) => ({
					series: model.getReference(),
					path: field.getStoragePath(),
					operator: 'eq',
					value: ids.map((datum) => field.read(datum)),
				})),
			},
		});

		const rtn = res.map((datum) =>
			this.onRead(ctx, this.model.fromDeflated(datum)),
		);

		if (this.settings.controller) {
			return this.settings.controller.canRead(ctx, rtn, this);
		} else {
			return rtn;
		}
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

	// TODO: finish
	// This method is largely used to interface with graphql,
	// you pass in how you are joining, and any filters to run
	async select(
		ctx: ContextSecurityInterface,
		selector: ServiceAdapterSelector,
	): Promise<InternalT['structure'][]> {
		const model = this.getModel();
		const imploded = model.implodeStorage(
			this.deflate(ctx, selector.params),
		);
		const res = await this.settings.adapter.read(ctx, {
			select: {
				models: [getStorageModel(model)],
			},
			params: {
				ops: Object.entries(imploded).map(([path, value]) => ({
					series: model.getReference(),
					path,
					operator: 'eq',
					value,
				})),
			},
		});

		const rtn = res.map((datum) =>
			this.onRead(ctx, this.model.fromDeflated(datum)),
		);

		// TODO: I need to do something about the actions here

		return this.settings.controller
			? this.settings.controller.canRead(ctx, rtn, this)
			: rtn;
	}

	async externalSelect(
		ctx: ContextSecurityInterface,
		query: ServiceAdapterSelector,
	): Promise<ExternalT['structure'][]> {
		return (await this.select(ctx, query)).map((datum) =>
			this.inflate(ctx, datum),
		);
	}

	// TODO: finish
	// This method is calling a complex query that is based on,
	// this object. It should use a query builder that I need to
	// implement yet
	async search(
		ctx: ContextSecurityInterface,
		search: InternalT['search'],
	): Promise<InternalT['structure'][]> {
		const model = this.getModel();
		const imploded = model.implode(this.deflate(ctx, search));
		const res = await this.settings.adapter.read(ctx, {
			select: {
				models: [getStorageModel(model)],
			},
			params: {
				ops: Object.entries(imploded).map(([path, value]) => ({
					series: model.getReference(),
					path,
					operator: 'eq',
					value,
				})),
			},
		});

		const rtn = res.map((datum) =>
			this.onRead(ctx, this.model.fromDeflated(datum)),
		);

		this.settings.controller;
		return this.settings.controller
			? this.settings.controller.canRead(ctx, rtn, this)
			: rtn;
	}

	async externalSearch(
		ctx: ContextSecurityInterface,
		search: ExternalT['search'],
	): Promise<ExternalT['structure'][]> {
		return (await this.search(ctx, this.model.fromInflated(search))).map(
			(datum) => this.inflate(ctx, datum),
		);
	}

	async update(
		ctx: ContextSecurityInterface,
		content: ServiceUpdateDelta<InternalT>[],
	): Promise<InternalT['structure'][]> {
		const model = this.getModel();
		const incoming = content.map((change) => {
			change.delta = this.onUpdate(ctx, change.delta);

			return change;
		});

		content = this.settings.controller
			? await this.settings.controller.canUpdate(ctx, incoming, this)
			: incoming;

		const validations = (
			await Promise.all(
				content.map(({delta}) => this.model.validate(delta, 'update')),
			)
		).flat();

		if (validations.length) {
			// TODO: How to report all the errors?
			throw new Error(validations[0]);
		}

		const rtn = await Promise.all(
			content.map((change) =>
				this.settings.adapter.update(ctx, {
					model: getStorageModel(model),
					params: [model.implodeStorage(this.deflate(ctx, change.delta))],
					where: {
						params: {
							ops: model.getPrimaryFields().map((field) => ({
								series: model.getReference(),
								path: field.getStoragePath(),
								operator: 'eq',
								value: field.read(change.ref),
							})),
						},
					},
				}),
			),
		);

		return rtn.flat().map((datum) => this.model.fromDeflated(datum));
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
		const model = this.getModel();
		const fields = model.getPrimaryFields();
		const filtered = this.settings.controller
			? await this.settings.controller.canDelete(ctx, ids, this)
			: ids;
		const datums = await this.read(ctx, filtered);

		const count = await this.settings.adapter.delete(
			ctx,
			{
				model: getStorageModel(model),
				params: {
					ops: fields.map((field) => ({
						series: model.getReference(),
						path: field.getStoragePath(),
						operator: 'eq',
						value: ids.map((datum) => field.read(datum)),
					})),
				},
			},
			// filtered.map((ref) => this.deflate(ctx, ref)),
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
