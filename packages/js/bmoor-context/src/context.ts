import {
	ContextualError,
	ErrorContext,
	InvocationContext,
} from '@bmoor/error';

import type {
	ContextSecurityInterface,
	ContextSettings,
	EnvVariable,
	FeatureFlag,
} from './context.interface.ts';

export class Context implements ContextSecurityInterface {
	error?: ContextualError;
	settings: ContextSettings;

	permissionDex: Map<string, boolean | string>;

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

	hasFlag(featureFlag: FeatureFlag): boolean {
		if (this.settings.flags && featureFlag in this.settings.flags) {
			return !!this.settings.flags[featureFlag];
		} else {
			return false;
		}
	}

	getFlag(featureFlag: FeatureFlag): string {
		const flag = this.settings.flags?.[featureFlag];

		if (flag) {
			if (typeof flag === 'boolean') {
				return 'ok';
			} else {
				return flag;
			}
		} else {
			return null;
		}
	}

	getVariable(envVar: EnvVariable) {
		return this.settings.variables?.[envVar] || null;
	}

	log(...args) {
		if (!this.hasFlag('silent')) {
			console.log(...args);
		}
	}

	setError(error: Error, settings?: ErrorContext) {
		if (!this.error) {
			this.error = new ContextualError(error);
		}

		if (settings) {
			this.addErrorContext(settings);
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
