import {FieldType, ContextInterface as OldContext} from '@bmoor/schema';

import {ConvertFn} from './converter.interface';
import {HookInterface, HookReference} from './hook.interface';
import {TypingJSON} from './typing.interface';

// TODO: I might want to split context and nexus
export interface ContextInterface<TypingT extends TypingJSON = TypingJSON>
	extends OldContext<TypingT> {
	getHook(ref: HookReference): HookInterface;

	getConverter(from: FieldType, to: FieldType): ConvertFn;
}
