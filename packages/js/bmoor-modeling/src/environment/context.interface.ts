import {
	EnvironmentContextInterface as OldContextInterface,
	SchemaReference,
} from '@bmoor/schema';

import type {ModelInterface} from '../model.interface.ts';
import type {ServiceInterface} from '../service.interface.ts';

export interface EnvironmentContextInterface<
	ModelT extends ModelInterface = ModelInterface,
> extends OldContextInterface<ModelT> {
	getService(ref: SchemaReference): ServiceInterface;
}
