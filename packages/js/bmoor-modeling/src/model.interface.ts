import {DynamicObject} from '@bmoor/object';
import {
	FieldReference,
	SchemaInterface,
	SchemaSettings,
	SchemaStructure,
} from '@bmoor/schema';

import {HookReference} from './hook.interface';

export type HookRegister =
	| HookReference
	| {ref: HookReference; args: object};
export interface ModelJSON extends SchemaSettings {
	deflate?: SchemaStructure;
	inflate?: SchemaStructure;
	hooks?: Record<FieldReference, HookRegister | HookRegister[]>;
}

export interface ModelSettings extends ModelJSON {}

export interface ModelInterface<
	StructureT = DynamicObject,
	UpdateT = DynamicObject,
> extends SchemaInterface {
	// Internal representation to storage
	deflate(input: StructureT): DynamicObject;
	fromDeflated(input: DynamicObject): StructureT;

	// Internal representation to external
	inflate(input: StructureT): DynamicObject;
	fromInflated(input: DynamicObject): StructureT;

	onCreate(input: StructureT): StructureT;
	onRead(input: StructureT): StructureT;
	onUpdate(input: UpdateT): UpdateT;
	onInflate(input: StructureT): StructureT;
	onDeflate(input: StructureT): StructureT;
}
