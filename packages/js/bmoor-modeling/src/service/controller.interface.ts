import {ContextSecurityInterface} from '@bmoor/context';

import {Model} from '../model';
import {
	ServiceExternalGenerics,
	ServiceInterface,
	ServiceInternalGenerics,
	ServiceStorageGenerics,
	ServiceUpdateDelta,
} from '../service.interface';

export interface ServiceControllerSettings {
	permission?: {
		create?: string;
		read?: string;
		update?: string;
		delete?: string;
	};
	model: Model;
}

export interface ServiceControllerInterface<
	InternalT extends ServiceInternalGenerics = ServiceInternalGenerics,
	ExternalT extends ServiceExternalGenerics = ServiceExternalGenerics,
	StorageT extends ServiceStorageGenerics = ServiceStorageGenerics,
> {
	// securing data that has been requested
	canRead(
		ctx: ContextSecurityInterface,
		datums: InternalT['structure'][],
		service: ServiceInterface<InternalT, ExternalT, StorageT>,
	): Promise<InternalT['structure'][]>;

	// securing data that has been submitted
	canCreate(
		ctx: ContextSecurityInterface,
		datums: InternalT['structure'][],
		service: ServiceInterface<InternalT, ExternalT, StorageT>,
	): Promise<InternalT['structure'][]>;

	canUpdate(
		ctx: ContextSecurityInterface,
		content: ServiceUpdateDelta<InternalT>[],
		service: ServiceInterface<InternalT, ExternalT, StorageT>,
	): Promise<ServiceUpdateDelta<InternalT>[]>;

	canDelete(
		ctx: ContextSecurityInterface,
		content: InternalT['reference'][],
		service: ServiceInterface<InternalT, ExternalT, StorageT>,
	): Promise<InternalT['reference'][]>;
}
