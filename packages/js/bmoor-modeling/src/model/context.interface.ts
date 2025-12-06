import {FieldType, SchemaContextInterface} from '@bmoor/schema';

import type {ConvertFn} from '../converter.interface.ts';
import type {HookInterface, HookReference} from '../hook.interface.ts';
import type {TypingJSON} from '../typing.interface.ts';

// TODO: I might want to split context and nexus
export interface ModelContextInterface<
	TypingT extends TypingJSON = TypingJSON,
> extends SchemaContextInterface<TypingT> {
	getHook(ref: HookReference): HookInterface;

	getConverter(from: FieldType, to: FieldType): ConvertFn;
}
