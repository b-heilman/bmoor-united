export interface ContextSecurityInterface {
	hasPermission(permission: string): boolean;
	hasClaim(claim: string): Promise<boolean>;
}

// TODO: ContextDataInteface

export interface ContextSettings {
	permissions: string[];
}
