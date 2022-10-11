import {ContextSecurityInterface} from '@bmoor/context';

import {ModelFieldInterface} from './field.interface';
import {ExternalKeyReader} from './accessor.interface';
import {ModelUpdate} from '../datum.interface';

export interface ModelControllerSettings {
	permission?: {
		create?: string;
		read?: string;
		update?: string;
		delete?: string;
	};
	fields?: ModelFieldInterface[];
}

export interface ModelControllerInterface<
	ExternalRead,
	ExternalReference,
	ExternalCreate,
	ExternalUpdate
> {
	// securing data that has been requested
	canRead(
		datums: ExternalRead[],
		fn: ExternalKeyReader<ExternalRead, ExternalReference>,
		ctx: ContextSecurityInterface
	): Promise<ExternalRead[]>;

	// securing data that has been submitted
	canCreate(
		datums: ExternalCreate[],
		ctx: ContextSecurityInterface
	): Promise<ExternalCreate[]>;

	canUpdate(
		content: ModelUpdate<ExternalReference, ExternalUpdate>[],
		ctx: ContextSecurityInterface
	): Promise<ModelUpdate<ExternalReference, ExternalUpdate>[]>;
}
