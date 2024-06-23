import {ContextSecurityInterface} from '@bmoor/context';
import {SchemaInterface, TypingReference} from '@bmoor/schema';

import {
	ServiceUpdateDelta,
	ServiceInterface,
	ServiceSettings,
	ReferenceType,
	SearchType,
	ServiceHooks,
	ServiceInternalGenerics,
	ServiceExternalGenerics,
	ServiceStorageGenerics,
} from './service.interface';
import { DeltaType, ModelInterface, StructureType } from './model.interface';

function actionExtend(old, action) {
	if (old) {
		return function (datum, ctx) {
			return action(old(datum, ctx), ctx);
		};
	} else {
		return action;
	}
}
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
	StorageT extends ServiceStorageGenerics = ServiceStorageGenerics
> implements ServiceInterface<
	InternalT,
	ExternalT,
	StorageT
> {
	hooks?: ServiceHooks<InternalT>;
	model: ModelInterface<InternalT, ExternalT, StorageT>;
	settings: ServiceSettings<InternalT, StorageT>;

	constructor(
		model: ModelInterface<InternalT, ExternalT, StorageT>,
		settings: ServiceSettings<InternalT, StorageT>,
		hooks?: ServiceHooks<InternalT>
	) {
		this.hooks = hooks;
		this.model = model;
		this.settings = settings;
	}

	async create(
		ctx: ContextSecurityInterface,
		content: ExternalT['structure'][],
	): Promise<ExternalT['structure'][]> {
		const internal = content.map(
			datum => {
				const rtn = this.model.fromInflated(datum);

				this.model.onCreate(rtn);

				return rtn;
			}
		);

		if (this.hooks.onCreate) {
			internal.forEach((datum) => this.hooks.onCreate(ctx, datum));
		}

		const validations = (await Promise.all(
			internal.map(datum => this.model.validate(datum, 'create'))
		)).flat();

		if (validations.length){
			// TODO: How to report all the errors?
			throw new Error(validations[0]);
		}

		const allowed = await this.settings.controller.canCreate(ctx, content, this);

		const rtn = await this.settings.adapter.create(
			allowed.map((datum) => this.model.deflate(datum))
		);

		return rtn.map((datum) => this.model.inflate(
			this.model.fromDeflated(datum)
		));
	}

	async read(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT[]> {
		const res = await this.settings.adapter.read(
			ids.map((ref) => this.convertToInternal(ref, ctx))
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

	async update(
		ctx: ContextSecurityInterface,
		content: ServiceUpdateDelta<ReferenceT, DeltaT>[],
	): Promise<ExternalT[]> {
		if (this.actions.update) {
			content.map(({delta}) => this.actions.update(delta, ctx));
		}

		if (this.settings.validator?.validateUpdate) {
			// TODO: I need the concept of a compound error
			const error = await this.settings.validator.validateUpdate(content);

			if (error) {
				throw error;
			}
		}

		const send = await this.settings.controller.canUpdate(content, ctx);
		const converted: UpdateDelta<ReferenceT, DeltaT>[] =
			send.map((change) => ({
				ref: <ReferenceT>this.convertToInternal(change.ref, ctx),
				delta: <DeltaT>this.convertToInternal(change.delta, ctx),
			}));

		const rtn = await this.settings.adapter.update(converted);

		return rtn.map((datum) => this.convertToExternal(datum, ctx));
	}

	async delete(
		ctx: ContextSecurityInterface,
		ids: ReferenceT[],
	): Promise<ExternalT[]> {
		// TODO: canDelete

		const datums = await this.read(ids, ctx);

		const count = await this.settings.adapter.delete(
			<ReferenceT[]>(
				ids.map((ref) => this.convertToInternal(ref, ctx))
			),
		);

		if (count !== datums.length) {
			// TODO: do i care?
		}

		return datums;
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
