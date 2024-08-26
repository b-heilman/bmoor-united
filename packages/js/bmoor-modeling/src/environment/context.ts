import {
	EnvironmentContext as OldContext,
	SchemaReference,
} from '@bmoor/schema';

import {ConveterInterface} from '../converter.interface';
import {HookerInterface} from '../hooker.interface';
import {ModelInterface} from '../model.interface';
import {ServiceInterface} from '../service.interface';
import {EnvironmentContextInterface} from './context.interface';

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
