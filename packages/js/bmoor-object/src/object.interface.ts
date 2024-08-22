export type IgnoreSettings = {[key: string]: boolean | IgnoreSettings};

export interface ImplodeSettings {
	ignore?: IgnoreSettings;
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	skipInstanceOf?: any;
}
