import {
	FieldType,
	SchemaContext,
	TypingInterface,
	ValidatorInterface,
} from '@bmoor/schema';

import {ConvertFn, ConveterInterface} from '../converter.interface.ts';
import {HookInterface, HookReference} from '../hook.interface.ts';
import {HookerInterface} from '../hooker.interface.ts';
import {TypingJSON} from '../typing.interface.ts';
import {ModelContextInterface} from './context.interface.ts';

export class ModelContext<TypingT extends TypingJSON>
	extends SchemaContext<TypingT>
	implements ModelContextInterface<TypingT>
{
	hooker: HookerInterface;
	converter: ConveterInterface;

	constructor(
		types: TypingInterface<TypingT>,
		validator: ValidatorInterface,
		hooker: HookerInterface,
		converter: ConveterInterface,
	) {
		super(types, validator);

		this.setHooker(hooker);
		this.setConverter(converter);
	}

	setHooker(hooker: HookerInterface) {
		this.hooker = hooker;
	}

	getHook(ref: HookReference): HookInterface {
		return this.hooker.getHook(ref);
	}

	setConverter(converter: ConveterInterface) {
		this.converter = converter;
	}

	getConverter(from: FieldType, to: FieldType): ConvertFn {
		return this.converter.getConverter(from, to);
	}
}
