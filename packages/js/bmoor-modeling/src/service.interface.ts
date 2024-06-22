import {ContextSecurityInterface} from '@bmoor/context';
import {ConnectionActionsType} from '@bmoor/schema';

import {UpdateDelta} from './datum.interface';
import {ModelInterface} from './model.interface';
import {ModelFieldInterface} from './model/field.interface';
import {ServiceAdapterInterface} from './service/adapter.interface';
import {ServiceControllerInterface} from './service/controller.interface';

export interface ServiceSettings<StructureT, ReferenceT, DeltaT, SearchT> {
	adapter: ServiceAdapterInterface<
		StructureT,
		ReferenceT,
		DeltaT,
		SearchT
	>;
	controller: ServiceControllerInterface<StructureT, ReferenceT, DeltaT>;
}

export type ServiceHooks<StructureT, DeltaT> = {
	onCreate?(ctx: ContextSecurityInterface, datum: StructureT): void;
	onRead?(ctx: ContextSecurityInterface, datum: StructureT): void;
	onUpdate?(ctx: ContextSecurityInterface, change: DeltaT): void;
	onInflate?(ctx: ContextSecurityInterface, datum: StructureT): void;
	onDeflate?(ctx: ContextSecurityInterface, datum: StructureT): void;
};

export interface ServiceInterface<
	StructureT,
	ReferenceT,
	DeltaT,
	SearchT,
> {
	create(
		ctx: ContextSecurityInterface,
		content: StructureT[],
	): Promise<StructureT[]>;
	read(
		ctx: ContextSecurityInterface,
		ids: StructureT[],
	): Promise<StructureT[]>;
	update(
		ctx: ContextSecurityInterface,
		content: UpdateDelta<ReferenceT, DeltaT>[],
	): Promise<StructureT[]>;
	delete(
		ctx: ContextSecurityInterface,
		ids: ReferenceT[],
	): Promise<StructureT[]>;
	search(
		ctx: ContextSecurityInterface,
		search: SearchT,
	): Promise<StructureT[]>;
}
