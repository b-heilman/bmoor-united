import {
	EnvironmentContext as OldContext,
	SchemaReference,
} from '@bmoor/schema';

import type {ConveterInterface} from '../converter.interface.ts';
import type {HookerInterface} from '../hooker.interface.ts';
import type {ModelInterface} from '../model.interface.ts';
import type {ServiceInterface} from '../service.interface.ts';
import type {EnvironmentContextInterface} from './context.interface.ts';

export class EnvironmentContext
	extends OldContext<ModelInterface>
	implements EnvironmentContextInterface
{
	hooker: HookerInterface;
	services: Record<SchemaReference, ServiceInterface>;
	converter: ConveterInterface;

	constructor() {
		super();

		this.services = {};
	}

	addService(service: ServiceInterface) {
		const schema = service.getModel();

		this.services[schema.getReference()] = service;

		this.addSchema(schema);
	}

	getService(ref: SchemaReference): ServiceInterface {
		return this.services[ref];
	}
}
