import {ContextSecurityInterface} from '@bmoor/context';
import {DynamicObject} from '@bmoor/object';

import type {ModelInternalGenerics} from '../model.interface.ts';
import type {
	RequestCreate,
	RequestDelete,
	RequestRead,
	RequestUpdate,
} from '../request.interface.ts';
import type {
	ServiceSelectActionsType,
	ServiceSelectType,
} from './select.interface.ts';

export interface ServiceAdapterGenerics extends ModelInternalGenerics {
	reference?: DynamicObject;
	delta?: DynamicObject;
	select?: ServiceSelectType;
	search?: DynamicObject;
}

export interface ServiceAdapterInterface<
	AdapterT extends ServiceAdapterGenerics = ServiceAdapterGenerics,
> {
	create(
		ctx: ContextSecurityInterface,
		request: RequestCreate,
	): Promise<AdapterT['reference'][]>;
	read(
		ctx: ContextSecurityInterface,
		request: RequestRead,
		actions?: ServiceSelectActionsType,
	): Promise<AdapterT['structure'][]>;
	update(
		ctx: ContextSecurityInterface,
		request: RequestUpdate,
	): Promise<AdapterT['structure'][]>;
	delete?(
		ctx: ContextSecurityInterface,
		request: RequestDelete,
	): Promise<number>; // return the rows deleted
}
