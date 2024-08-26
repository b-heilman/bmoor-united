import {toCamelCase} from '@bmoor/string';

import {
	TypingInterface,
	TypingJSON,
	TypingReference,
} from '../typing.interface';
import {ValidationReference} from '../validation.interface';
import {ValidatorInterface} from '../validator.interface';
import {SchemaContextInterface} from './context.interface';

export class SchemaContext<TypingT extends TypingJSON>
	implements SchemaContextInterface<TypingT>
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
