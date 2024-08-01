import {ContextSecurityInterface} from '@bmoor/context';
import {DynamicObject} from '@bmoor/object';
import {TypingReference} from '@bmoor/schema';

import {
	ModelExternalGenerics,
	ModelInterface,
	ModelInternalGenerics,
} from './model.interface';
import {
	ServiceAdapterGenerics,
	ServiceAdapterInterface,
	ServiceAdapterSelector,
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
	controller?: ServiceControllerInterface<InternalT>;
	actions?: ServiceQueryActions;
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

export type ServiceQueryActions = Record<string, TypingReference>;

export interface ServiceInterface<
	InternalT extends ServiceInternalGenerics = ServiceInternalGenerics,
	ExternalT extends ServiceExternalGenerics = ServiceExternalGenerics,
	StorageT extends ServiceStorageGenerics = ServiceStorageGenerics,
> {
	settings: ServiceSettings<InternalT, StorageT>;
	hooks?: ServiceHooks<InternalT>;

	create(
		ctx: ContextSecurityInterface,
		content: InternalT['structure'][],
	): Promise<InternalT['structure'][]>;
	externalCreate(
		ctx: ContextSecurityInterface,
		content: ExternalT['structure'][],
	): Promise<ExternalT['structure'][]>;
	read(
		ctx: ContextSecurityInterface,
		ids: InternalT['reference'][],
	): Promise<InternalT['structure'][]>;
	externalRead(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]>;
	select(
		ctx: ContextSecurityInterface,
		selector: ServiceAdapterSelector,
	): Promise<InternalT['structure'][]>;
	externalSelect(
		ctx: ContextSecurityInterface,
		selector: ServiceAdapterSelector,
	): Promise<ExternalT['structure'][]>;
	search(
		ctx: ContextSecurityInterface,
		search: InternalT['search'],
	): Promise<InternalT['structure'][]>;
	externalSearch(
		ctx: ContextSecurityInterface,
		search: ExternalT['search'],
	): Promise<ExternalT['structure'][]>;
	update(
		ctx: ContextSecurityInterface,
		content: ServiceUpdateDelta<InternalT>[],
	): Promise<InternalT['structure'][]>;
	externalUpdate(
		ctx: ContextSecurityInterface,
		content: ServiceUpdateDelta<ExternalT>[],
	): Promise<ExternalT['structure'][]>;
	delete(
		ctx: ContextSecurityInterface,
		ids: InternalT['reference'][],
	): Promise<InternalT['structure'][]>;
	externalDelete(
		ctx: ContextSecurityInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]>;

	getModel(): ModelInterface<InternalT, ExternalT, StorageT>;
	getQueryActions(): ServiceQueryActions;
}
