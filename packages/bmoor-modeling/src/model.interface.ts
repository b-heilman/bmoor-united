import {ContextSecurityInterface} from '@bmoor/context';

import {ModelControllerInterface} from './model/controller.interface';
import {ModelValidatorInterface} from './model/validator.interface';
import {ModelAdapterInterface} from './model/adapter.interface';
import {ModelFieldInterface} from './model/field.interface';
import {ModelAccessorInterface} from './model/accessor.interface';
import {ModelFieldSet} from './model/field/set';

export interface ModelSettings<External, Reference, Delta, Internal> {
	adapter: ModelAdapterInterface<Reference, Delta, Internal>;
	accessor: ModelAccessorInterface<External, Delta, Internal>;
	controller: ModelControllerInterface<External, Delta>;
	validator?: ModelValidatorInterface<External, Delta>;
	fields: ModelFieldSet;
}

export type ModelActions<External, Delta> = {
	create?(datum: External, ctx?: ContextSecurityInterface): void;
	read?(datum: External, ctx?: ContextSecurityInterface): void;
	update?(datum: Delta, ctx?: ContextSecurityInterface): void;
	delete?(datum: External, ctx?: ContextSecurityInterface): void;
	inflate?(datum: External, ctx?: ContextSecurityInterface): void;
	deflate?(datum: External, ctx?: ContextSecurityInterface): void;
};

export interface ModelInterface<
	External,
	Reference,
	Delta,
	Search,
	Internal
> {
	fields: Map<string, ModelFieldInterface>;
	settings: ModelSettings<External, Reference, Delta, Internal>;
	actions: ModelActions<External, Delta>;

	create(
		content: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;
	read(
		ids: Reference[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;
	update(
		content: Delta[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;
	delete(
		ids: Reference[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;
	search(
		search: Search,
		ctx: ContextSecurityInterface
	): Promise<External[]>;

	getByPath(external: string);
	convertToInternal(content: External[]): Internal[];
	convertToExternal(content: Internal[]): External[];
}
