import {ContextSecurityInterface} from '@bmoor/context';

import {UpdateDelta} from './datum.interface';
import {Model} from './model';
import {ModelFieldInterface} from './model/field.interface';
import {ServiceAccessorInterface} from './service/accessor.interface';
import {ServiceAdapterInterface} from './service/adapter.interface';
import {ServiceControllerInterface} from './service/controller.interface';
import {ServiceValidatorInterface} from './service/validator.interface';

export interface ServiceSettings<
	ExternalRead,
	ExternalReference,
	ExternalCreate,
	ExternalUpdate,
	InternalRead,
	InternalReference,
	InternalCreate,
	InternalUpdate,
	InternalSearch,
> {
	adapter: ServiceAdapterInterface<
		InternalRead,
		InternalReference,
		InternalCreate,
		InternalUpdate,
		InternalSearch
	>;
	accessor: ServiceAccessorInterface<
		ExternalRead,
		ExternalReference,
		InternalRead,
		InternalReference
	>;
	controller: ServiceControllerInterface<
		ExternalRead,
		ExternalReference,
		ExternalCreate,
		ExternalUpdate
	>;
	validator?: ServiceValidatorInterface<
		ExternalReference,
		ExternalCreate,
		ExternalUpdate
	>;
	model: Model;
}

export type ServiceActions<
	ExternalRead,
	ExternalReference,
	ExternalCreate,
	ExternalUpdate,
	ExternalSearch,
> = {
	create?(datum: ExternalCreate, ctx?: ContextSecurityInterface): void;
	read?(datum: ExternalRead, ctx?: ContextSecurityInterface): void;
	update?(change: ExternalUpdate, ctx?: ContextSecurityInterface): void;
	inflate?(datum: ExternalRead, ctx?: ContextSecurityInterface): void;
	deflate?(
		datum:
			| ExternalRead
			| ExternalReference
			| ExternalCreate
			| ExternalUpdate
			| ExternalSearch,
		ctx?: ContextSecurityInterface,
	): void;
};

export interface ServiceInterface<
	ExternalRead,
	ExternalReference,
	ExternalCreate,
	ExternalUpdate,
	ExternalSearch,
	InternalRead,
	InternalReference,
	InternalCreate,
	InternalUpdate,
	InternalSearch,
> {
	fields: Map<string, ModelFieldInterface>;
	settings: ServiceSettings<
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
	actions: ServiceActions<
		ExternalRead,
		ExternalReference,
		ExternalCreate,
		ExternalUpdate,
		ExternalSearch
	>;

	create(
		content: ExternalCreate[],
		ctx: ContextSecurityInterface,
	): Promise<ExternalRead[]>;
	read(
		ids: ExternalReference[],
		ctx: ContextSecurityInterface,
	): Promise<ExternalRead[]>;
	update(
		content: UpdateDelta<ExternalReference, ExternalUpdate>[],
		ctx: ContextSecurityInterface,
	): Promise<ExternalRead[]>;
	delete(
		ids: ExternalReference[],
		ctx: ContextSecurityInterface,
	): Promise<ExternalRead[]>;
	search(
		search: ExternalSearch,
		ctx: ContextSecurityInterface,
	): Promise<ExternalRead[]>;

	convertToInternal(
		content:
			| ExternalReference
			| ExternalCreate
			| ExternalCreate
			| ExternalUpdate
			| ExternalSearch,
		ctx: ContextSecurityInterface,
	): InternalReference | InternalCreate | InternalUpdate | InternalSearch;
	convertToExternal(
		content: InternalRead,
		ctx: ContextSecurityInterface,
	): ExternalRead;
}
