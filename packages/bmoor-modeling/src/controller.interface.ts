import {ContextSecurityInterface} from '@bmoor/context';

import {ModelFieldInterface} from './model/field.interface';

export interface ControllerSettings {
	permission?: string;
	fields?: ModelFieldInterface[];
}

export interface ControllerInterface<External> {
	// securing data that has been requested
	canRead(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;

	// securing data that has been submitted
	canCreate(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;

	canUpdate(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;
}
