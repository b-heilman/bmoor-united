import { DynamicObject } from '@bmoor/object';
import {UpdateDelta} from '../datum.interface';
import { ModelInternalGenerics } from '../model.interface';

export interface ServiceAdapterGenerics extends ModelInternalGenerics {
	reference?: DynamicObject,
	delta?: DynamicObject,
	search?: DynamicObject
}

export interface ServiceAdapterInterface<
	AdapterT extends ServiceAdapterGenerics = ServiceAdapterGenerics
> {
	// TODO: make sure these are right? Seed and Delta are
	//   generally external
	create(content: AdapterT['structure'][]): Promise<AdapterT['structure'][]>;
	read(ids: AdapterT['reference'][]): Promise<AdapterT['structure'][]>;
	update(
		content: UpdateDelta<AdapterT['reference'], AdapterT['delta']>[],
	): Promise<AdapterT['structure'][]>;
	delete?(ids: AdapterT['reference'][]): Promise<number>; // return the rows deleted
	search?(search: AdapterT['search']): Promise<AdapterT['structure'][]>;
}
