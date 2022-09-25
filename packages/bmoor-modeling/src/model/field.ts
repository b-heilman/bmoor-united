import {
	ModelFieldInterface,
	ModelFieldSettings,
	ModelFieldTypescript
} from './field.interface';

export class ModelField implements ModelFieldInterface {
	incomingSettings: ModelFieldSettings;

	constructor(settings: ModelFieldSettings) {
		this.incomingSettings = settings;
	}

	toTypescript(): ModelFieldTypescript {
		return {
			internal: {
				path: '',
				format: ''
			},
			external: {
				path: '',
				format: ''
			}
		};
	}
}
