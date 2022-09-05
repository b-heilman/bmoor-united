import {ContextSecurityInterface} from '@bmoor/context';

import {ExternalDatum} from './datum.interface';

export interface SecuritySettings {
	permission?: string;
}

export interface SecurityInterface {
	// securing data that has been requested
	canRead(
		datums: ExternalDatum[],
		ctx: ContextSecurityInterface
	): ExternalDatum[];

	// securing data that has been submitted
	canCreate(
		datums: ExternalDatum[],
		ctx: ContextSecurityInterface
	): ExternalDatum[];

	canUpdate(
		datums: ExternalDatum[],
		ctx: ContextSecurityInterface
	): ExternalDatum[];
}
