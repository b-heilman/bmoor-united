import {Mapping} from '@bmoor/path';
import {FieldInterface, Schema, reduceStructure} from '@bmoor/schema';

import {ContextInterface} from './context.interface';
import {HookInterface} from './hook.interface';
import {
	ModelExternalGenerics,
	ModelInterface,
	ModelInternalGenerics,
	ModelJSON,
	ModelSettings,
	ModelStorageGenerics,
} from './model.interface';

function runHooks(obj, model: Model, action: string) {
	if ('hooks' in this.settings) {
		for (const row of Object.entries(model.settings.hooks)) {
			const fieldRef = row[0];

			let field: FieldInterface;
			let hooks = row[1];

			if (!Array.isArray(hooks)) {
				hooks = [hooks];
			}

			for (const hook of hooks) {
				let hookReg: HookInterface;
				let hookArgs;
				if (typeof hook === 'string') {
					hookReg = model.ctx.getHook(hook);
					hookArgs = {};
				} else {
					hookReg = model.ctx.getHook(hook.ref);
					hookArgs = hook.args;
				}

				if (action in hookReg) {
					if (!field) {
						field = model.getField(fieldRef);
					}

					const value = field.read(obj);
					const res = hookReg.onCreate(value, hookArgs);

					if (res !== undefined) {
						field.write(obj, res);
					}
				}
			}
		}
	}
}
/***
 * A Model is all about the data's structure.  Actions to be performed against the model will
 * be in the service.
 ***/
export class Model<
		InternalT extends ModelInternalGenerics = ModelInternalGenerics,
		ExternalT extends ModelExternalGenerics = ModelExternalGenerics,
		StorageT extends ModelStorageGenerics = ModelStorageGenerics,
	>
	extends Schema
	implements ModelInterface<InternalT, ExternalT, StorageT>
{
	ctx: ContextInterface;
	settings: ModelJSON;

	deflator: {
		from: Mapping;
		to: Mapping;
	};
	inflator: {
		from: Mapping;
		to: Mapping;
	};

	constructor(settings: ModelSettings) {
		super(settings);

		if (settings.inflate) {
			const mappings = reduceStructure(settings.inflate).map((field) => ({
				from: field.path,
				to: this.getField(field.ref).getPath(),
			}));

			this.inflator = {
				from: new Mapping(mappings),
				to: new Mapping(mappings.map((m) => ({from: m.to, to: m.from}))),
			};
		} else {
			this.inflator = null;
		}

		if (settings.deflate) {
			const mappings = reduceStructure(settings.deflate).map((field) => ({
				from: field.path,
				to: this.getField(field.ref).getPath(),
			}));

			this.deflator = {
				from: new Mapping(mappings),
				to: new Mapping(mappings.map((m) => ({from: m.to, to: m.from}))),
			};
		} else {
			this.deflator = null;
		}
	}

	setContext(ctx: ContextInterface) {
		this.ctx = ctx;
	}

	inflate(obj: InternalT['structure']): ExternalT['structure'] {
		if (this.inflator) {
			return this.inflator.to.transform(obj);
		} else {
			return <unknown>obj;
		}
	}

	fromInflated(obj: ExternalT['structure']): InternalT['structure'] {
		if (this.inflator) {
			return this.inflator.from.transform(obj);
		} else {
			// TODO: How to check it StructureT actually == DynamicObject?
			return <unknown>obj;
		}
	}

	deflate(obj: InternalT['structure']): StorageT['structure'] {
		if (this.deflator) {
			return this.deflator.to.transform(obj);
		} else {
			return obj;
		}
	}

	fromDeflated(obj: StorageT['structure']): InternalT['structure'] {
		if (this.deflator) {
			return this.deflator.from.transform(obj);
		} else {
			return <unknown>obj;
		}
	}

	onCreate(obj: InternalT['structure']): void {
		runHooks(obj, this, 'onCreate');
	}

	onRead(obj: InternalT['structure']): void {
		runHooks(obj, this, 'onRead');
	}

	onUpdate(obj: InternalT['structure']): void {
		runHooks(obj, this, 'onUpdate');
	}

	onInflate(obj: InternalT['structure']): void {
		runHooks(obj, this, 'onInflate');
	}

	onDeflate(obj: InternalT['structure']): void {
		runHooks(obj, this, 'onDeflate');
	}
}
