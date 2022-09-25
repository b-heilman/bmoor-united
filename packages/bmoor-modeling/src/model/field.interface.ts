export interface ModelFieldDisplay {
	title: string;
	description: string;
}

export interface ModelFieldSettings {
	internal: string;
	external: string;
	type?: string;
	jsonType?: string;
	display?: ModelFieldDisplay;
}

export type ModelFieldTypescript = {
	internal: {
		path: string;
		format: string;
	};
	external: {
		path: string;
		format: string;
	};
};

export interface ModelFieldInterface {
	incomingSettings: ModelFieldSettings;
	toTypescript(): ModelFieldTypescript;
}

export type ModelFieldSet = ModelFieldInterface[];
