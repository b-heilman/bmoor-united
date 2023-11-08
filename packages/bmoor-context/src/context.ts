import {
	ContextualError,
	ErrorContext,
	InvocationContext,
} from '@bmoor/error';

import {
	ContextSecurityInterface,
	ContextSettings,
	EnvVariable,
	FeatureFlag,
} from './context.interface';

export class Context implements ContextSecurityInterface {
	error?: ContextualError;
	settings: ContextSettings;

	permissionDex: Map<string, boolean>;

	constructor(settings: ContextSettings) {
		this.permissionDex = null;

		this.settings = settings;
	}

	hasPermission(permission: string) {
		if (!this.permissionDex) {
			// lazy load this
			this.permissionDex = new Map<string, boolean>(
				this.settings.permissions.map((permission) => [permission, true]),
			);
		}
		return this.permissionDex.has(permission);
	}

	async hasClaim(/*claim: string*/) {
		return false;
	}

	hasFlag(featureFlag: FeatureFlag) {
		return this.settings.flags?.[featureFlag] || false;
	}

	getVariable(envVar: EnvVariable) {
		return this.settings.variables?.[envVar] || null;
	}

	log(...args) {
		if (!this.hasFlag('silent')) {
			console.log(...args);
		}
	}

	setError(error: Error) {
		if (!this.error) {
			this.error = new ContextualError(error);
		}

		return this;
	}

	setErrorInvocation(invocation: InvocationContext) {
		if (!this.error) {
			this.error = new ContextualError(new Error('invocated stub error'));
		}

		this.error.setInvocation(invocation);

		return this;
	}

	addErrorContext(settings: ErrorContext) {
		if (!this.error) {
			this.error = new ContextualError(new Error('context stub error'));
		}

		this.error.addContext(settings);

		return this;
	}

	close() {
		if (this.error) {
			this.log(this.error.toString());
		}
	}
}
