import {ContextSecurityInterface} from '@bmoor/context';

import {
	ModelControllerInterface,
	ModelControllerSettings
} from './controller.interface';

export class ModelController<External>
	implements ModelControllerInterface<External>
{
	incomingSettings: ModelControllerSettings;

	constructor(settings: ModelControllerSettings) {
		this.incomingSettings = settings;
	}

	// securing data that has been submitted
	async canCreate(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]> {
		const permission = this.incomingSettings.permission?.create;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not create');
		}
	}

	async canRead(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]> {
		const permission = this.incomingSettings.permission?.read;

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
		const permission = this.incomingSettings.permission?.update;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not update');
		}
	}
	
	async canDelete(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]> {
		const permission = this.incomingSettings.permission?.delete;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not update');
		}
	}
}
