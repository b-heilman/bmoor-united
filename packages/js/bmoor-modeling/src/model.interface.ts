import {DynamicObject} from '@bmoor/object';
import {
	ConnectionActionsType,
	SchemaInterface,
	SchemaSettings,
	SchemaStructure,
} from '@bmoor/schema';

export interface ModelJSON<
	ActionsT extends ConnectionActionsType = ConnectionActionsType,
> extends SchemaSettings<ActionsT> {
	deflate?: SchemaStructure;
	inflate?: SchemaStructure;
}

export interface ModelSettings<
	ActionsT extends ConnectionActionsType = ConnectionActionsType,
> extends ModelJSON<ActionsT> {}

export interface ModelInterface<
	ActionsT extends ConnectionActionsType = ConnectionActionsType,
> extends SchemaInterface<ActionsT> {
	// Internal representation to storage
	deflate(input: DynamicObject): DynamicObject;
	// Internal representation to external
	inflate(input: DynamicObject): DynamicObject;
}
