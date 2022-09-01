export interface ModelFieldDisplay {
	title: string;
	description: string;
}

export interface ModelFieldSettings {
	internal: string;
	external: string;
	type?: string;
	jsonType?: string;
	display: ModelFieldDisplay;
}

export interface ModelFieldInterface {
	settings: ModelFieldSettings;
}
