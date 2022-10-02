import {ContextSecurityInterface} from '@bmoor/context';

import {ModelFieldInterface} from './field.interface';
import {ExternalKeyReader, DeltaKeyReader} from './properties.interface';

export interface ModelControllerSettings {
	permission?: {
		create?: string;
		read?: string;
		update?: string;
		delete?: string;
	};
	fields?: ModelFieldInterface[];
}

export interface ModelControllerInterface<External, Delta> {
	// securing data that has been requested
	canRead(
		datums: External[],
		fn: ExternalKeyReader<External>,
		ctx: ContextSecurityInterface
	): Promise<External[]>;

	// securing data that has been submitted
	canCreate(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;

	canUpdate(
		datums: Delta[],
		fn: DeltaKeyReader<Delta>,
		ctx: ContextSecurityInterface
	): Promise<Delta[]>;
}
