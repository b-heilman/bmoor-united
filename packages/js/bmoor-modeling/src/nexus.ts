import {
	Dictionary,
	SchemaReference,
	TypingInterface,
	ValidatorInterface,
} from '@bmoor/schema';

import {ContextInterface} from './context.interface';
import {HookInterface, HookReference} from './hook.interface';
import {HookerInterface} from './hooker.interface';
import {ModelInterface} from './model.interface';
import {ServiceInterface} from './service.interface';
import {TypingJSON} from './typing.interface';

export class Nexus<
		TypingT extends TypingJSON,
		SchemaT extends ModelInterface,
	>
	extends Dictionary<TypingT, SchemaT>
	implements ContextInterface<TypingT>
{
	hooker: HookerInterface;
	services: Record<SchemaReference, ServiceInterface<SchemaT>>;

	constructor(
		types: TypingInterface<TypingT>,
		validator: ValidatorInterface,
		hooker: HookerInterface,
	) {
		super(types, validator);

		this.services = {};
		this.setHooker(hooker);
	}

	addService(service: ServiceInterface<SchemaT>) {
		const schema = service.getSchema();

		this.services[schema.getReference()] = service;

		this.addSchema(schema);
	}

	getService(ref: SchemaReference): ServiceInterface<SchemaT> {
		return this.services[ref];
	}

	setHooker(hooker: HookerInterface) {
		this.hooker = hooker;
	}

	getHook(ref: HookReference): HookInterface {
		return this.hooker.getHook(ref);
	}
}