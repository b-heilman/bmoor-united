import {ContextSecurityInterface} from '@bmoor/context';
import {DynamicObject} from '@bmoor/object';

import {ModelInternalGenerics} from '../model.interface';
import {
	RequestCreate,
	RequestDelete,
	RequestRead,
	RequestUpdate,
} from '../request.interface';
import {
	ServiceSelectActionsType,
	ServiceSelectType,
} from './select.interface';

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
