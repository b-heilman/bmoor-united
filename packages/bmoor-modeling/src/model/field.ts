import {ModelFieldInterface, ModelFieldSettings} from './field.interface';

export class ModelField implements ModelFieldInterface {
	incomingSettings: ModelFieldSettings;

	constructor(settings: ModelFieldSettings) {
		this.incomingSettings = settings;
	}
}
