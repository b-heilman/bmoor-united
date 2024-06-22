import {ContextSecurityInterface} from '@bmoor/context';

import {UpdateDelta} from '../datum.interface';
import {Model} from '../model';

export interface ServiceControllerSettings {
	permission?: {
		create?: string;
		read?: string;
		update?: string;
		delete?: string;
	};
	model: Model;
}

export interface ServiceControllerInterface<
	StructureT,
	ReferenceT,
	DeltaT,
> {
	// securing data that has been requested
	canRead(
		datums: ReferenceT[],
		ctx: ContextSecurityInterface,
	): Promise<ReferenceT[]>;

	// securing data that has been submitted
	canCreate(
		datums: StructureT[],
		ctx: ContextSecurityInterface,
	): Promise<StructureT[]>;

	canUpdate(
		content: UpdateDelta<ReferenceT, DeltaT>[],
		ctx: ContextSecurityInterface,
	): Promise<UpdateDelta<ReferenceT, DeltaT>[]>;

	canDelete(
		content: ReferenceT[],
		ctx: ContextSecurityInterface,
	): Promise<ReferenceT[]>;
}
