import {ContextSecurityInterface} from '@bmoor/context';
import {DynamicObject} from '@bmoor/object';

import {
	ModelExternalGenerics,
	ModelInterface,
	ModelInternalGenerics,
} from './model.interface';
import {
	ServiceAdapterGenerics,
	ServiceAdapterInterface,
} from './service/adapter.interface';
import {ServiceControllerInterface} from './service/controller.interface';

export type ReferenceType = DynamicObject;
export type SearchType = {
	datum: DynamicObject;
	params: DynamicObject;
};

export interface ServiceInternalGenerics extends ModelInternalGenerics {
	reference?: DynamicObject;
	search?: DynamicObject;
}

export interface ServiceExternalGenerics extends ModelExternalGenerics {
	reference?: DynamicObject;
	delta?: DynamicObject;
	search?: DynamicObject;
}

export interface ServiceStorageGenerics extends ServiceAdapterGenerics {}

export interface ServiceUpdateDelta<
	Generics extends ServiceInternalGenerics,
> {
	ref: Generics['reference'];
	delta: Generics['delta'];
}

export interface ServiceSettings<
	InternalT extends ServiceInternalGenerics = ServiceInternalGenerics,
	StorageT extends ServiceStorageGenerics = ServiceStorageGenerics,
> {
	adapter: ServiceAdapterInterface<StorageT>;
	controller: ServiceControllerInterface<InternalT>;
}

export type ServiceDatumModifierFn<StructureT> = (
	ctx: ContextSecurityInterface,
	datum: StructureT,
) => void;

export type ServiceDeltaModifierFn<DeltaT> = (
	ctx: ContextSecurityInterface,
	datum: DeltaT,
) => void;

export interface ServiceHooks<
	InternalT extends ServiceInternalGenerics = ServiceInternalGenerics,
> {
	onCreate?: ServiceDatumModifierFn<InternalT['structure']>;
	onRead?: ServiceDatumModifierFn<InternalT['structure']>;
	onUpdate?: ServiceDeltaModifierFn<InternalT['delta']>;
	onInflate?: ServiceDatumModifierFn<InternalT['structure']>;
	onDeflate?: ServiceDatumModifierFn<InternalT['structure']>;
}

export type ServiceQueryParams = Record<string, string | number>;

export interface ServiceInterface<
	InternalT extends ServiceInternalGenerics = ServiceInternalGenerics,
	ExternalT extends ServiceExternalGenerics = ServiceExternalGenerics,
	StorageT extends ServiceStorageGenerics = ServiceStorageGenerics,
> {
	settings: ServiceSettings<InternalT, StorageT>;
	hooks?: ServiceHooks<InternalT>;

	create(
		ctx: ContextSecurityInterface,
		content: ExternalT['structure'][],
	): Promise<ExternalT['structure'][]>;
	read(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]>;
	update(
		ctx: ContextSecurityInterface,
		content: ServiceUpdateDelta<ExternalT>[],
	): Promise<ExternalT['structure'][]>;
	delete(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]>;
	search(
		ctx: ContextSecurityInterface,
		search: ExternalT['search'],
	): Promise<ExternalT['structure'][]>;

	getModel(): ModelInterface<InternalT, ExternalT, StorageT>;
	getQueryParams(): ServiceQueryParams;
}
