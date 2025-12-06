import type {
	ErrorContext,
	InvocationContext,
} from './context.interface.ts';

export class ContextualError {
	parent: Error;
	invocation: InvocationContext;
	stack: ErrorContext[];

	constructor(err: Error) {
		this.parent = err;
		this.stack = [];
	}

	setInvocation(invocation: InvocationContext) {
		this.invocation = invocation;

		return this;
	}

	addContext(settings: ErrorContext) {
		this.stack.push(settings);

		return this;
	}

	toJSON() {
		return {
			message: this.parent.message,
			stackTrace: this.parent.stack,

			...this.invocation,

			stack: this.stack,
		};
	}

	toString() {
		const builder = [];
		if (this.invocation) {
			builder.push(`> info: ${JSON.stringify(this.invocation, null, 2)}`);
		}

		if (this.parent.message) {
			builder.push(`> error: ${this.parent.message}`);
		}

		if (this.parent.stack) {
			builder.push(`> stack: ${this.parent.stack.toString()}`);
		}

		if (this.stack) {
			builder.push('> context trace');
			this.stack.forEach((row) => {
				builder.push('  >' + JSON.stringify(row, null, 2));
			});
		}

		return builder.join('\n');
	}
}

export function extendError(
	ex: Error | ContextualError,
	settings: ErrorContext,
): ContextualError {
	const err =
		ex instanceof ContextualError ? ex : new ContextualError(<Error>ex);

	return err.addContext(settings);
}

export function assignError(
	ex: Error | ContextualError,
	settings: InvocationContext,
): ContextualError {
	const err =
		ex instanceof ContextualError ? ex : new ContextualError(<Error>ex);

	return err.setInvocation(settings);
}

export function wrapError(ex: Error | ContextualError): ContextualError {
	return ex instanceof ContextualError
		? ex
		: new ContextualError(<Error>ex);
}

export function create(
	message: string,
	settings: ErrorContext,
): ContextualError {
	return extendError(new Error(message), settings);
}
