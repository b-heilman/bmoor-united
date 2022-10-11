import {ModelUpdate} from '../datum.interface';

export interface ModelAdapterInterface<
	InternalRead,
	InternalReference,
	InternalCreate,
	InternalUpdate,
	InternalSearch
> {
	// TODO: make sure these are right? Seed and Delta are
	//   generally external
	create(content: InternalCreate[]): Promise<InternalRead[]>;
	read(ids: InternalReference[]): Promise<InternalRead[]>;
	update(
		content: ModelUpdate<InternalReference, InternalUpdate>[]
	): Promise<InternalRead[]>;
	delete?(
		ids: InternalReference[]
	): Promise<number>; // return the rows deleted
	search?(search: InternalSearch): Promise<InternalRead[]>;
}
