import {ContextSecurityInterface} from '@bmoor/context';
import {DynamicObject} from '@bmoor/object';

import {ModelInternalGenerics} from '../model.interface';
import {
	RequestCreate,
	RequestDelete,
	RequestParameters,
	RequestRead,
	RequestUpdate,
} from '../request.interface';

export type ServiceAdapterSelector = {
	params?: RequestParameters;
	actions?: DynamicObject;
};

export interface ServiceAdapterGenerics extends ModelInternalGenerics {
	reference?: DynamicObject;
	delta?: DynamicObject;
	select?: ServiceAdapterSelector;
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
