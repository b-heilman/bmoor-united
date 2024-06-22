import {
	ContextInterface as OldContext,
	SchemaReference,
} from '@bmoor/schema';

import {HookInterface, HookReference} from './hook.interface';
import {ServiceInterface} from './service.interface';
import {TypingJSON} from './typing.interface';

export interface ContextInterface<TypingT extends TypingJSON = TypingJSON>
	extends OldContext<TypingT> {
	getService(ref: SchemaReference): ServiceInterface;

	getHook(ref: HookReference): HookInterface;
}
