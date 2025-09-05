import {DynamicObject} from '@bmoor/object';
import {TypingReference} from '@bmoor/schema';

import {
	ModelExternalGenerics,
	ModelInterface,
	ModelInternalGenerics,
} from './model.interface.ts';
import {
	ServiceAdapterGenerics,
	ServiceAdapterInterface,
} from './service/adapter.interface.ts';
import {ServiceContextInterface} from './service/context.interface.ts';
import {ServiceControllerInterface} from './service/controller.interface.ts';
import {ServiceSearchType} from './service/search.interface.ts';
import {
	ServiceSelectActionType,
	ServiceSelectSettings,
	ServiceSelectType,
} from './service/select.interface.ts';

export type ReferenceType = DynamicObject;

export interface ServiceInternalGenerics extends ModelInternalGenerics {
	reference?: DynamicObject;
	search?: ServiceSearchType;
}

export interface ServiceExternalGenerics extends ModelExternalGenerics {
	reference?: DynamicObject;
	delta?: DynamicObject;
	search?: ServiceSearchType;
}

// eslint-disable-next-line
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
	actions?: ServiceSelectSettings;
}

export type ServiceDatumModifierFn<StructureT> = (
	ctx: ServiceContextInterface,
	datum: StructureT,
) => void;

export type ServiceDeltaModifierFn<DeltaT> = (
	ctx: ServiceContextInterface,
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

export interface ServiceInterface<
	InternalT extends ServiceInternalGenerics = ServiceInternalGenerics,
	ExternalT extends ServiceExternalGenerics = ServiceExternalGenerics,
	StorageT extends ServiceStorageGenerics = ServiceStorageGenerics,
> {
	settings: ServiceSettings<InternalT, StorageT>;
	hooks?: ServiceHooks<InternalT>;

	create(
		ctx: ServiceContextInterface,
		content: InternalT['structure'][],
	): Promise<InternalT['structure'][]>;
	externalCreate(
		ctx: ServiceContextInterface,
		content: ExternalT['structure'][],
	): Promise<ExternalT['structure'][]>;
	read(
		ctx: ServiceContextInterface,
		ids: InternalT['reference'][],
	): Promise<InternalT['structure'][]>;
	externalRead(
		ctx: ServiceContextInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]>;
	select(
		ctx: ServiceContextInterface,
		selector: ServiceSelectType,
	): Promise<InternalT['structure'][]>;
	externalSelect(
		ctx: ServiceContextInterface,
		selector: ServiceSelectType,
	): Promise<ExternalT['structure'][]>;
	search(
		ctx: ServiceContextInterface,
		search: InternalT['search'],
	): Promise<InternalT['structure'][]>;
	externalSearch(
		ctx: ServiceContextInterface,
		search: ExternalT['search'],
	): Promise<ExternalT['structure'][]>;
	update(
		ctx: ServiceContextInterface,
		content: ServiceUpdateDelta<InternalT>[],
	): Promise<InternalT['structure'][]>;
	externalUpdate(
		ctx: ServiceContextInterface,
		content: ServiceUpdateDelta<ExternalT>[],
	): Promise<ExternalT['structure'][]>;
	delete(
		ctx: ServiceContextInterface,
		ids: InternalT['reference'][],
	): Promise<InternalT['structure'][]>;
	externalDelete(
		ctx: ServiceContextInterface,
		ids: ExternalT['reference'][],
	): Promise<ExternalT['structure'][]>;

	getModel(): ModelInterface<InternalT, ExternalT, StorageT>;
	getSelectActionTypes(): Record<ServiceSelectActionType, TypingReference>;
}
