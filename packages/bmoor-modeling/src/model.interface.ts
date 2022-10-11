import {ContextSecurityInterface} from '@bmoor/context';

import {ModelControllerInterface} from './model/controller.interface';
import {ModelValidatorInterface} from './model/validator.interface';
import {ModelAdapterInterface} from './model/adapter.interface';
import {ModelFieldInterface} from './model/field.interface';
import {ModelAccessorInterface} from './model/accessor.interface';
import {ModelFieldSet} from './model/field/set';
import {ModelUpdate} from './datum.interface';

export interface ModelSettings<
	ExternalRead,
	ExternalReference,
	ExternalCreate,
	ExternalUpdate,
	InternalRead,
	InternalReference,
	InternalCreate,
	InternalUpdate,
	InternalSearch
> {
	name: string;
	adapter: ModelAdapterInterface<
		InternalRead,
		InternalReference,
		InternalCreate,
		InternalUpdate,
		InternalSearch
	>;
	accessor: ModelAccessorInterface<
		ExternalRead,
		ExternalReference,
		InternalRead,
		InternalReference
	>;
	controller: ModelControllerInterface<
		ExternalRead,
		ExternalReference,
		ExternalCreate,
		ExternalUpdate
	>;
	validator?: ModelValidatorInterface<
		ExternalReference,
		ExternalCreate,
		ExternalUpdate
	>;
	fields: ModelFieldSet;
}

export type ModelActions<
	ExternalRead,
	ExternalReference,
	ExternalCreate,
	ExternalUpdate,
	ExternalSearch
> = {
	create?(
		datum: ExternalCreate, 
		ctx?: ContextSecurityInterface
	): void;
	read?(
		datum: ExternalRead, 
		ctx?: ContextSecurityInterface
	): void;
	update?(
		change: ModelUpdate<ExternalReference, ExternalUpdate>,
		ctx?: ContextSecurityInterface
	): void;
	inflate?(
		datum: ExternalRead, 
		ctx?: ContextSecurityInterface
	): void;
	deflate?(
		datum: ExternalRead | ExternalReference | ExternalCreate | ExternalUpdate | ExternalSearch, 
		ctx?: ContextSecurityInterface
	): void;
};

export interface ModelInterface<
	ExternalRead,
	ExternalReference,
	ExternalCreate,
	ExternalUpdate,
	ExternalSearch,
	InternalRead,
	InternalReference,
	InternalCreate,
	InternalUpdate,
	InternalSearch
> {
	fields: Map<string, ModelFieldInterface>;
	settings: ModelSettings<
		ExternalRead,
		ExternalReference,
		ExternalCreate,
		ExternalUpdate,
		InternalRead,
		InternalReference,
		InternalCreate,
		InternalUpdate,
		InternalSearch
	>;
	actions: ModelActions<
		ExternalRead,
		ExternalReference,
		ExternalCreate,
		ExternalUpdate,
		ExternalSearch
	>;

	create(
		content: ExternalCreate[],
		ctx: ContextSecurityInterface
	): Promise<ExternalRead[]>;
	read(
		ids: ExternalReference[],
		ctx: ContextSecurityInterface
	): Promise<ExternalRead[]>;
	update(
		content: ModelUpdate<ExternalReference, ExternalUpdate>[],
		ctx: ContextSecurityInterface
	): Promise<ExternalRead[]>;
	delete(
		ids: ExternalReference[],
		ctx: ContextSecurityInterface
	): Promise<ExternalRead[]>;
	search(
		search: ExternalSearch,
		ctx: ContextSecurityInterface
	): Promise<ExternalRead[]>;

	getByPath(path: string): ModelFieldInterface;
	convertToInternal(
		content: ExternalReference | ExternalCreate | ExternalCreate | ExternalUpdate | ExternalSearch,
		ctx: ContextSecurityInterface
	): InternalReference | InternalCreate | InternalUpdate | InternalSearch;
	convertToExternal(
		content: InternalRead,
		ctx: ContextSecurityInterface
	): ExternalRead;
}
