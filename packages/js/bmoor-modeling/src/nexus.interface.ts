import {KnowledgeInterface, SchemaReference} from '@bmoor/schema';

import {ModelInterface} from './model.interface';
import {ServiceInterface} from './service.interface';

export interface NexusInterface<
	ModelT extends ModelInterface = ModelInterface,
> extends KnowledgeInterface<ModelT> {
	getService(ref: SchemaReference): ServiceInterface;
}
