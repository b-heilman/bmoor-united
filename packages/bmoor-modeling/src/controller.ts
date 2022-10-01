import {ContextSecurityInterface} from '@bmoor/context';

import {
	ControllerInterface,
	ControllerSettings
} from './controller.interface';

export class Controller<External>
	implements ControllerInterface<External>
{
	incomingSettings: ControllerSettings;

	constructor(settings: ControllerSettings) {
		this.incomingSettings = settings;
	}

	async canRead(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]> {
		const permission = this.incomingSettings.permission;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not read');
		}
	}

	// securing data that has been submitted
	async canCreate(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]> {
		const permission = this.incomingSettings.permission;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not read');
		}
	}

	async canUpdate(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]> {
		const permission = this.incomingSettings.permission;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not read');
		}
	}
}
