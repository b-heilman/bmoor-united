import {
	FieldType,
	Context as OldContext,
	TypingInterface,
	ValidatorInterface,
} from '@bmoor/schema';

import {ContextInterface} from './context.interface';
import {ConvertFn, ConveterInterface} from './converter.interface';
import {HookInterface, HookReference} from './hook.interface';
import {HookerInterface} from './hooker.interface';
import {TypingJSON} from './typing.interface';

export class Context<TypingT extends TypingJSON>
	extends OldContext<TypingT>
	implements ContextInterface<TypingT>
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
