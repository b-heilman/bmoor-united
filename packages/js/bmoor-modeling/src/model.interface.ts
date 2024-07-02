import {DynamicObject} from '@bmoor/object';
import {
	FieldReference,
	SchemaInterface,
	SchemaSettings,
	SchemaStructure,
} from '@bmoor/schema';

import {HookReference} from './hook.interface';

export type DeltaType = DynamicObject;
export type StructureType = DynamicObject;

export type HookRegister =
	| HookReference
	| {ref: HookReference; args: object};
export interface ModelJSON extends SchemaSettings {
	deflate?: SchemaStructure;
	inflate?: SchemaStructure;
	hooks?: Record<FieldReference, HookRegister | HookRegister[]>;
}

export interface ModelSettings extends ModelJSON {}

export interface ModelInternalGenerics {
	structure?: DynamicObject;
	delta?: DynamicObject;
}

export interface ModelExternalGenerics {
	structure?: DynamicObject;
}

export interface ModelStorageGenerics {
	structure?: DynamicObject;
}

export interface ModelInterface<
	InternalT extends ModelInternalGenerics = ModelInternalGenerics,
	ExternalT extends ModelExternalGenerics = ModelExternalGenerics,
	StorageT extends ModelStorageGenerics = ModelStorageGenerics,
> extends SchemaInterface {
	// Internal representation to storage
	deflate(input: InternalT['structure']): StorageT['structure'];
	fromDeflated(input: StorageT['structure']): InternalT['structure'];

	// Internal representation to external
	inflate(input: InternalT['structure']): ExternalT['structure'];
	fromInflated(input: ExternalT['structure']): InternalT['structure'];

	onCreate(input: InternalT['structure']): InternalT['structure'];
	onRead(input: InternalT['structure']): InternalT['structure'];
	onUpdate(input: InternalT['delta']): InternalT['delta'];
	onInflate(input: InternalT['structure']): InternalT['structure'];
	onDeflate(input: InternalT['structure']): InternalT['structure'];
}
