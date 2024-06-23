import { SchemaInterface } from '@bmoor/schema';
import {ContextSecurityInterface} from '@bmoor/context';

import {
	ReferenceType,
	SearchType,
	ServiceExternalGenerics,
	ServiceInterface,
	ServiceInternalGenerics,
	ServiceStorageGenerics,
	ServiceUpdateDelta,
} from '../service.interface';
import {
	ServiceControllerInterface,
	ServiceControllerSettings,
} from './controller.interface';
import { DeltaType, StructureType } from '../model.interface';


export class ServiceController<
	InternalT extends ServiceInternalGenerics = ServiceInternalGenerics,
	ExternalT extends ServiceExternalGenerics = ServiceExternalGenerics,
	StorageT extends ServiceStorageGenerics = ServiceStorageGenerics
> implements ServiceControllerInterface<
	InternalT,
	ExternalT,
	StorageT
> {
	settings: ServiceControllerSettings;

	constructor(settings: ServiceControllerSettings) {
		this.settings = settings;
	}

	// securing data that has been submitted
	async canCreate(
		ctx: ContextSecurityInterface,
		datums: InternalT['structure'][],
		service: ServiceInterface<InternalT, ExternalT, StorageT>,
	): Promise<InternalT['structure'][]> {
		const permission = this.settings.permission?.create;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not create');
		}
	}

	async canRead(
		ctx: ContextSecurityInterface,
		datums: InternalT['structure'][],
		service: ServiceInterface<InternalT, ExternalT, StorageT>,
	): Promise<InternalT['structure'][]> {
		const permission = this.settings.permission?.read;

		if (!permission || ctx.hasPermission(permission)) {
			return datums;
		} else {
			throw new Error('can not read');
		}
	}

	async canUpdate(
		ctx: ContextSecurityInterface,
		content: ServiceUpdateDelta<InternalT>[],
		service: ServiceInterface<InternalT, ExternalT, StorageT>,
	): Promise<ServiceUpdateDelta<InternalT>[]> {
		const permission = this.settings.permission?.update;

		if (!permission || ctx.hasPermission(permission)) {
			return content;
		} else {
			throw new Error('can not update');
		}
	}

	async canDelete(
		ctx: ContextSecurityInterface,
		content: InternalT['reference'][],
		service: ServiceInterface<InternalT, ExternalT, StorageT>,
	): Promise<InternalT['reference'][]> {
		const permission = this.settings.permission?.delete;

		if (!permission || ctx.hasPermission(permission)) {
			return content;
		} else {
			throw new Error('can not delete');
		}
	}
}
