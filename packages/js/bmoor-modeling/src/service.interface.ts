import {ContextSecurityInterface} from '@bmoor/context';
import {DynamicObject} from '@bmoor/object';
import {SchemaInterface, TypingReference} from '@bmoor/schema';

import {UpdateDelta} from './datum.interface';
import {ServiceAdapterInterface} from './service/adapter.interface';
import {ServiceControllerInterface} from './service/controller.interface';

export type StructureType = DynamicObject;
export type ReferenceType = DynamicObject;
export type DeltaType = DynamicObject;
export type SearchType = DynamicObject;

export interface ServiceSettings<
	StructureT = StructureType,
	ReferenceT = ReferenceType,
	DeltaT = DeltaType,
	SearchT = SearchType,
> {
	adapter: ServiceAdapterInterface<
		StructureT,
		ReferenceT,
		DeltaT,
		SearchT
	>;
	controller: ServiceControllerInterface<StructureT, ReferenceT, DeltaT>;
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
	StructureT = StructureType,
	DeltaT = DeltaType,
> {
	onCreate?: ServiceDatumModifierFn<StructureT>;
	onRead?: ServiceDatumModifierFn<StructureT>;
	onUpdate?: ServiceDeltaModifierFn<DeltaT>;
	onInflate?: ServiceDatumModifierFn<StructureT>;
	onDeflate?: ServiceDatumModifierFn<StructureT>;
}

export interface ServiceInterface<
	SchemaT = SchemaInterface,
	StructureT = StructureType,
	ReferenceT = ReferenceType,
	DeltaT = DeltaType,
	SearchT = SearchType,
	ExternalT = StructureType,
> {
	settings: ServiceSettings<StructureT, ReferenceT, DeltaT, SearchT>;
	hooks: ServiceHooks<StructureT, DeltaT>;

	create(
		ctx: ContextSecurityInterface,
		content: ExternalT[],
	): Promise<ExternalT[]>;
	read(
		ctx: ContextSecurityInterface,
		ids: ReferenceT[],
	): Promise<ExternalT[]>;
	update(
		ctx: ContextSecurityInterface,
		content: UpdateDelta<ReferenceT, DeltaT>[],
	): Promise<ExternalT[]>;
	delete(
		ctx: ContextSecurityInterface,
		ids: ReferenceT[],
	): Promise<ExternalT[]>;
	search(
		ctx: ContextSecurityInterface,
		search: SearchT,
	): Promise<ExternalT[]>;

	getSchema(): SchemaT;
	getQueryParams(): Record<string, TypingReference>;
}
