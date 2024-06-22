import {ContextSecurityInterface} from '@bmoor/context';

import {UpdateDelta} from '../datum.interface';
import {
	DeltaType,
	ReferenceType,
	ServiceInterface,
	StructureType,
} from '../service.interface';
import {
	ServiceControllerInterface,
	ServiceControllerSettings,
} from './controller.interface';

export class ServiceController<
	StructureT = StructureType,
	ReferenceT = ReferenceType,
	DeltaT = DeltaType,
> implements ServiceControllerInterface<StructureT, ReferenceT, DeltaT>
{
	settings: ServiceControllerSettings;

	constructor(settings: ServiceControllerSettings) {
		this.settings = settings;
	}

	// securing data that has been submitted
	async canCreate(
		ctx: ContextSecurityInterface,
		service: ServiceInterface,
		datums: StructureT[],
	): Promise<StructureT[]> {
		const permission = this.settings.permission?.create;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not create');
		}
	}

	async canRead(
		ctx: ContextSecurityInterface,
		service: ServiceInterface,
		datums: StructureT[],
	): Promise<StructureT[]> {
		const permission = this.settings.permission?.read;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not read');
		}
	}

	async canUpdate(
		ctx: ContextSecurityInterface,
		service: ServiceInterface,
		content: UpdateDelta<ReferenceT, DeltaT>[],
	): Promise<UpdateDelta<ReferenceT, DeltaT>[]> {
		const permission = this.settings.permission?.update;

		if (!permission || ctx.hasPermission(permission)) {
			return content;
		} else {
			throw new Error('can not update');
		}
	}

	async canDelete(
		ctx: ContextSecurityInterface,
		service: ServiceInterface,
		content: ReferenceT[],
	): Promise<ReferenceT[]> {
		const permission = this.settings.permission?.delete;

		if (!permission || ctx.hasPermission(permission)) {
			return content;
		} else {
			throw new Error('can not delete');
		}
	}
}
