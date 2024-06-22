import {UpdateDelta} from '../datum.interface';

export interface ServiceAdapterInterface<
	StructureT,
	ReferenceT,
	DeltaT,
	SearchT,
> {
	// TODO: make sure these are right? Seed and Delta are
	//   generally external
	create(content: StructureT[]): Promise<StructureT[]>;
	read(ids: ReferenceT[]): Promise<StructureT[]>;
	update(
		content: UpdateDelta<ReferenceT, DeltaT>[],
	): Promise<StructureT[]>;
	delete?(ids: ReferenceT[]): Promise<number>; // return the rows deleted
	search?(search: SearchT): Promise<StructureT[]>;
}
