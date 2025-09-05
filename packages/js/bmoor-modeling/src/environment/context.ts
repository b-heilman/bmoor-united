import {
	EnvironmentContext as OldContext,
	SchemaReference,
} from '@bmoor/schema';

import {ConveterInterface} from '../converter.interface.ts';
import {HookerInterface} from '../hooker.interface.ts';
import {ModelInterface} from '../model.interface.ts';
import {ServiceInterface} from '../service.interface.ts';
import {EnvironmentContextInterface} from './context.interface.ts';

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
