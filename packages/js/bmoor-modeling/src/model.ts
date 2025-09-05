import {Mapping} from '@bmoor/path';
import {MappingSettings} from '@bmoor/path/src/mapping.interface.ts';
import {FieldReference, Schema, reduceStructure} from '@bmoor/schema';

import {
	ModelExternalGenerics,
	ModelInterface,
	ModelInternalGenerics,
	ModelJSON,
	ModelSettings,
	ModelStorageGenerics,
} from './model.interface.ts';
import {ModelContextInterface} from './model/context.interface.ts';
import {
	ModelFieldInterface,
	ModelFieldJSON,
} from './model/field.interface.ts';
import {ModelField} from './model/field.ts';

function runHooks(obj, model: Model, action: string) {
	if ('hooks' in model.settings) {
		for (const row of Object.entries(model.settings.hooks)) {
			const fieldRef = row[0];
			const field = model.getField(fieldRef);
			const actor = row[1];

			let hooks;
			let hookArgs;
			if (typeof actor === 'string') {
				hooks = model.ctx.getHook(actor)[action];
				hookArgs = {};
			} else if (typeof actor === 'object' && 'ref' in actor) {
				hooks = model.ctx.getHook(actor.ref);
				hookArgs = actor.args;
			} else {
				hooks = actor[action];
				hookArgs = {};
			}

			if (!hooks) {
				continue;
			} else if (!Array.isArray(hooks)) {
				hooks = [hooks];
			}

			for (const hook of hooks) {
				const value = field.read(obj);
				const res = hook(value, hookArgs);

				if (res !== undefined) {
					field.write(obj, res);
				}
			}
		}
	}
}

function reduceMapings(
	model: Model,
	structure: Record<string, string>,
	target: 'storage' | 'external',
) {
	const from: MappingSettings[] = [];
	const to: MappingSettings[] = [];

	for (const [ref, path] of Object.entries(structure)) {
		const field = model.getField(ref);
		const fieldInfo = field.getInfo();
		const base = fieldInfo.type;
		const other = fieldInfo[target];

		let fromHook = null;
		let toHook = null;

		// TODO: validate types here?

		if (other !== undefined && base !== other) {
			const fromFn = model.ctx.getConverter(other, base);
			if (fromFn) {
				fromHook = fromFn;
			}

			const toFn = model.ctx.getConverter(base, other);
			if (toFn) {
				toHook = toFn;
			}
		}

		from.push({
			from: path,
			to: field.getPath(),
			hook: fromHook,
		});

		to.push({
			from: field.getPath(),
			to: path,
			hook: toHook,
		});
	}

	return {
		from: new Mapping(from),
		to: new Mapping(to),
	};
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
	ctx: ModelContextInterface;
	fields: Record<FieldReference, ModelFieldInterface>;
	externalPaths: Record<string, string>;
	storagePaths: Record<string, string>;
	settings: ModelJSON;

	deflator: {
		from: Mapping;
		to: Mapping;
	};
	inflator: {
		from: Mapping;
		to: Mapping;
	};

	constructor(ctx: ModelContextInterface, settings: ModelSettings) {
		super(ctx, settings);

		if (Object.keys(this.externalPaths).length) {
			this.inflator = reduceMapings(this, this.externalPaths, 'external');
		} else {
			this.inflator = null;
		}

		if (Object.keys(this.storagePaths).length) {
			this.deflator = reduceMapings(this, this.storagePaths, 'storage');
		} else {
			this.deflator = null;
		}
	}

	defineFields(): Record<FieldReference, ModelFieldInterface> {
		const settings = this.settings;

		if ('external' in settings) {
			const reducedExternal = reduceStructure(settings['external']);
			this.externalPaths = reducedExternal.reduce((agg, {ref, path}) => {
				agg[ref] = path;
				return agg;
			}, {});
		} else {
			this.externalPaths = {};
		}

		if ('storage' in settings) {
			const reducedStorage = reduceStructure(settings['storage']);
			this.storagePaths = reducedStorage.reduce((agg, {ref, path}) => {
				agg[ref] = path;
				return agg;
			}, {});
		} else {
			this.storagePaths = {};
		}

		const fields: ModelFieldJSON[] = reduceStructure(
			settings.structure,
		).map((field) =>
			Object.assign(field, {
				info: settings.info[field.ref],
				externalPath: this.externalPaths[field.ref],
				storagePath: this.storagePaths[field.ref],
			}),
		);

		const fieldDex = fields.reduce((agg, fieldSchema, dex) => {
			const field = new ModelField(fieldSchema);
			const ref = field.getReference() || 'field_' + dex;

			agg[ref] = field;

			if (settings.validators) {
				const validator = settings.validators[ref];
				if (validator) {
					field.setValidator(validator);
				}
			}

			return agg;
		}, {});

		return fieldDex;
	}

	getFields(): ModelFieldInterface[] {
		return Object.values(this.fields);
	}

	getField(ref: FieldReference): ModelFieldInterface {
		return this.fields[ref];
	}

	getPrimaryFields(): ModelFieldInterface[] {
		return <ModelFieldInterface[]>super.getPrimaryFields();
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

	implode(datum: InternalT['structure']): Record<string, unknown> {
		const rtn = {};

		for (const [key, field] of Object.entries(this.fields)) {
			const value = field.read(datum);
			if (value !== undefined) {
				rtn[key] = value;
			}
		}

		return rtn;
	}

	explode(root: Record<string, unknown>): InternalT['structure'] {
		const rtn = {};

		for (const [key, field] of Object.entries(this.fields)) {
			if (key in root) {
				field.write(rtn, root[key]);
			}
		}

		return rtn;
	}

	implodeStorage(datum: StorageT['structure']): Record<string, unknown> {
		const rtn = {};

		for (const field of Object.values(this.fields)) {
			const path = field.getStoragePath();
			const value = field.readStorage(datum);

			if (value !== undefined) {
				rtn[path] = value;
			}
		}

		return rtn;
	}

	explodeStorage(datum: Record<string, unknown>): StorageT['structure'] {
		const rtn = {};

		for (const field of Object.values(this.fields)) {
			const path = field.getStoragePath();

			if (path in datum) {
				field.writeStorage(rtn, datum[path]);
			}
		}

		return rtn;
	}

	fromDeflated(obj: StorageT['structure']): InternalT['structure'] {
		if (this.deflator) {
			return this.deflator.from.transform(obj);
		} else {
			return <unknown>obj;
		}
	}

	onCreate(obj: InternalT['structure']): InternalT['structure'] {
		runHooks(obj, this, 'onCreate');

		return obj;
	}

	onRead(obj: InternalT['structure']): InternalT['structure'] {
		runHooks(obj, this, 'onRead');

		return obj;
	}

	onUpdate(obj: InternalT['structure']): InternalT['structure'] {
		runHooks(obj, this, 'onUpdate');

		return obj;
	}

	onInflate(obj: InternalT['structure']): InternalT['structure'] {
		runHooks(obj, this, 'onInflate');

		return obj;
	}

	onDeflate(obj: InternalT['structure']): InternalT['structure'] {
		runHooks(obj, this, 'onDeflate');

		return obj;
	}
}
