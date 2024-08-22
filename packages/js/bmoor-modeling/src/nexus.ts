import {Knowledge, SchemaReference} from '@bmoor/schema';

import {ConveterInterface} from './converter.interface';
import {HookerInterface} from './hooker.interface';
import {ModelInterface} from './model.interface';
import {NexusInterface} from './nexus.interface';
import {ServiceInterface} from './service.interface';

export class Nexus
	extends Knowledge<ModelInterface>
	implements NexusInterface
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
