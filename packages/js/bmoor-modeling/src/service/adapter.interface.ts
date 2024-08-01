import {ContextSecurityInterface} from '@bmoor/context';
import {DynamicObject} from '@bmoor/object';

import {UpdateDelta} from '../datum.interface';
import {ModelInternalGenerics} from '../model.interface';

export type ServiceAdapterSelector = {
	properties?: DynamicObject;
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
		content: AdapterT['structure'][],
	): Promise<AdapterT['structure'][]>;
	read(
		ctx: ContextSecurityInterface,
		ids: AdapterT['reference'][],
	): Promise<AdapterT['structure'][]>;
	update(
		ctx: ContextSecurityInterface,
		content: UpdateDelta<AdapterT['reference'], AdapterT['delta']>[],
	): Promise<AdapterT['structure'][]>;
	delete?(
		ctx: ContextSecurityInterface,
		ids: AdapterT['reference'][],
	): Promise<number>; // return the rows deleted
	select?(
		ctx: ContextSecurityInterface,
		search: AdapterT['select'],
	): Promise<AdapterT['structure'][]>;
	search?(
		ctx: ContextSecurityInterface,
		search: AdapterT['search'],
	): Promise<AdapterT['structure'][]>;
}
