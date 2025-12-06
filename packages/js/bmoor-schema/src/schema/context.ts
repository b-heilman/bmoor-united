import {toCamelCase} from '@bmoor/string';

import type {
	TypingInterface,
	TypingJSON,
	TypingReference,
} from '../typing.interface.ts';
import type {ValidationReference} from '../validation.interface.ts';
import type {ValidatorInterface} from '../validator.interface.ts';
import type {SchemaContextInterface} from './context.interface.ts';

export class SchemaContext<
	TypingT extends TypingJSON,
> implements SchemaContextInterface<TypingT> {
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
