import {ContextSecurityInterface} from '@bmoor/context';

import {UpdateDelta} from '../datum.interface';
import {ExternalKeyReader} from './accessor.interface';
import {
	ServiceControllerInterface,
	ServiceControllerSettings,
} from './controller.interface';

export class ServiceController<
	ExternalRead,
	ExternalReference,
	ExternalCreate,
	ExternalUpdate,
> implements
		ServiceControllerInterface<
			ExternalRead,
			ExternalReference,
			ExternalCreate,
			ExternalUpdate
		>
{
	settings: ServiceControllerSettings;

	constructor(settings: ServiceControllerSettings) {
		this.settings = settings;
	}

	// securing data that has been submitted
	async canCreate(
		datums: ExternalCreate[],
		ctx: ContextSecurityInterface,
	): Promise<ExternalCreate[]> {
		const permission = this.settings.permission?.create;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not create');
		}
	}

	async canRead(
		datums: ExternalRead[],
		fn: ExternalKeyReader<ExternalRead, ExternalReference>,
		ctx: ContextSecurityInterface,
	): Promise<ExternalRead[]> {
		const permission = this.settings.permission?.read;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not read');
		}
	}

	async canUpdate(
		content: UpdateDelta<ExternalReference, ExternalUpdate>[],
		ctx: ContextSecurityInterface,
	): Promise<UpdateDelta<ExternalReference, ExternalUpdate>[]> {
		const permission = this.settings.permission?.update;

		if (!permission || ctx.hasPermission(permission)) {
			return content;
		} else {
			throw new Error('can not update');
		}
	}

	async canDelete(
		content: ExternalReference[],
		ctx: ContextSecurityInterface,
	): Promise<ExternalReference[]> {
		const permission = this.settings.permission?.delete;

		if (!permission || ctx.hasPermission(permission)) {
			return content;
		} else {
			throw new Error('can not delete');
		}
	}
}
