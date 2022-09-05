import {ContextSecurityInterface} from '@bmoor/context';

import {SecurityInterface, SecuritySettings} from './security.interface';
import {ExternalDatum} from './datum.interface';

export class Security implements SecurityInterface {
	incomingSettings: SecuritySettings;

	constructor(settings: SecuritySettings) {
		this.incomingSettings = settings;
	}

	canRead(
		datums: ExternalDatum[],
		ctx: ContextSecurityInterface
	): ExternalDatum[] {
		const permission = this.incomingSettings.permission;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not read');
		}
	}

	// securing data that has been submitted
	canCreate(
		datums: ExternalDatum[],
		ctx: ContextSecurityInterface
	): ExternalDatum[] {
		const permission = this.incomingSettings.permission;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not read');
		}
	}

	canUpdate(
		datums: ExternalDatum[],
		ctx: ContextSecurityInterface
	): ExternalDatum[] {
		const permission = this.incomingSettings.permission;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not read');
		}
	}
}
