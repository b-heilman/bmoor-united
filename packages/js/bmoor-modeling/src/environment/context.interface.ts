import {
	EnvironmentContextInterface as OldContextInterface,
	SchemaReference,
} from '@bmoor/schema';

import {ModelInterface} from '../model.interface';
import {ServiceInterface} from '../service.interface';

export interface EnvironmentContextInterface<
	ModelT extends ModelInterface = ModelInterface,
> extends OldContextInterface<ModelT> {
	getService(ref: SchemaReference): ServiceInterface;
}
