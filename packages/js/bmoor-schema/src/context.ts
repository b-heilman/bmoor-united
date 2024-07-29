import {toCamelCase} from '@bmoor/string';

import {ContextInterface} from './context.interface';
import {
	TypingInterface,
	TypingJSON,
	TypingReference,
} from './typing.interface';
import {ValidationReference} from './validation.interface';
import {ValidatorInterface} from './validator.interface';

export class Context<TypingT extends TypingJSON>
	implements ContextInterface<TypingT>
{
	typing: TypingInterface<TypingT>;
	validator: ValidatorInterface;

	constructor(
		types: TypingInterface<TypingT>,
		validator: ValidatorInterface,
	) {
		this.setTyping(types);
		this.setValidator(validator);
	}

	setTyping(typing: TypingInterface<TypingT>) {
		this.typing = typing;
	}

	getTyping(ref: TypingReference): TypingT {
		return this.typing.getType(ref);
	}

	setValidator(validator: ValidatorInterface) {
		this.validator = validator;
	}

	getValidation(ref: ValidationReference) {
		return this.validator.getValidation(ref);
	}

	formatName(ref: string): string {
		return toCamelCase(ref);
	}
}
