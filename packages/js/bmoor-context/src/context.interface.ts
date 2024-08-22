export type FeatureFlag = string;

export type Values = number | boolean | string;
export type EnvVariable = string;
export type EnvValue = Values | {[Key: EnvVariable]: EnvValue};

export interface ContextSecurityInterface {
	hasPermission(permission: string): boolean;
	hasClaim(claim: string): Promise<boolean>;
	hasFlag(flag: FeatureFlag): boolean;
	getFlag(flag: FeatureFlag): string;
	getVariable(envVar: EnvVariable): EnvValue;
}

// TODO: ContextDataInteface

export interface ContextSettings {
	permissions?: string[];
	variables?: {[Key: EnvVariable]: EnvValue};
	flags?: Record<string, boolean | string>;
}
