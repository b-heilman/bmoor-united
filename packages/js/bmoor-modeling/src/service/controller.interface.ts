import {ContextSecurityInterface} from '@bmoor/context';

import {UpdateDelta} from '../datum.interface';
import {Model} from '../model';
import {
	DeltaType,
	ReferenceType,
	ServiceInterface,
	StructureType,
} from '../service.interface';

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
	StructureT = StructureType,
	ReferenceT = ReferenceType,
	DeltaT = DeltaType,
> {
	// securing data that has been requested
	canRead(
		ctx: ContextSecurityInterface,
		service: ServiceInterface,
		datums: StructureT[],
	): Promise<StructureT[]>;

	// securing data that has been submitted
	canCreate(
		ctx: ContextSecurityInterface,
		service: ServiceInterface,
		datums: StructureT[],
	): Promise<StructureT[]>;

	canUpdate(
		ctx: ContextSecurityInterface,
		service: ServiceInterface,
		content: UpdateDelta<ReferenceT, DeltaT>[],
	): Promise<UpdateDelta<ReferenceT, DeltaT>[]>;

	canDelete(
		ctx: ContextSecurityInterface,
		service: ServiceInterface,
		content: ReferenceT[],
	): Promise<ReferenceT[]>;
}
