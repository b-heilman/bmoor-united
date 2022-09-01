import {ModelFieldSettings} from './field.interface';

export class ModelField {
	incomingSettings: ModelFieldSettings;

	constructor(settings: ModelFieldSettings) {
		this.incomingSettings = settings;
	}
}
