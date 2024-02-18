import {ContextSecurityInterface} from '@bmoor/context';

import {UpdateDelta} from '../datum.interface';
import {Model} from '../model';
import {ExternalKeyReader} from './accessor.interface';

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
	ExternalRead,
	ExternalReference,
	ExternalCreate,
	ExternalUpdate,
> {
	// securing data that has been requested
	canRead(
		datums: ExternalRead[],
		fn: ExternalKeyReader<ExternalRead, ExternalReference>,
		ctx: ContextSecurityInterface,
	): Promise<ExternalRead[]>;

	// securing data that has been submitted
	canCreate(
		datums: ExternalCreate[],
		ctx: ContextSecurityInterface,
	): Promise<ExternalCreate[]>;

	canUpdate(
		content: UpdateDelta<ExternalReference, ExternalUpdate>[],
		ctx: ContextSecurityInterface,
	): Promise<UpdateDelta<ExternalReference, ExternalUpdate>[]>;

	canDelete(
		content: ExternalReference[],
		ctx: ContextSecurityInterface,
	): Promise<ExternalReference[]>;
}
