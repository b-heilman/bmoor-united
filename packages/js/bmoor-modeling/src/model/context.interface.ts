import {FieldType, SchemaContextInterface} from '@bmoor/schema';

import {ConvertFn} from '../converter.interface';
import {HookInterface, HookReference} from '../hook.interface';
import {TypingJSON} from '../typing.interface';

// TODO: I might want to split context and nexus
export interface ModelContextInterface<
	TypingT extends TypingJSON = TypingJSON,
> extends SchemaContextInterface<TypingT> {
	getHook(ref: HookReference): HookInterface;

	getConverter(from: FieldType, to: FieldType): ConvertFn;
}
