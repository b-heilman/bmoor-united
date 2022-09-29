import {Config, ConfigObject} from '@bmoor/config';
import {makeSetter, makeGetter} from '@bmoor/object';

import {
	ModelFieldInterface,
	ModelFieldSettings,
	ModelFieldUsage,
	ModelFieldTypescript,
	ModelFieldSetter,
	ModelFieldGetter
} from './field.interface';

export const usages = new Config({
	json: new ConfigObject<ModelFieldUsage>({
		onInflate: function (datum, setter, getter) {
			const value = getter(datum);

			if (value) {
				setter(datum, JSON.parse(value));
			}
		},
		onDeflate: function (datum, setter, getter) {
			const value = getter(datum);

			if (value) {
				setter(datum, JSON.stringify(value));
			}
		}
	}),
	monitor: new ConfigObject<ModelFieldUsage>({
		onCreate: function (datum, setter, getter, cfg) {
			const target = cfg.getTarget(datum);

			if (target !== undefined) {
				setter(datum, Date.now());
			}
		},
		onUpdate: function (datum, setter, getter, cfg) {
			const target = cfg.getTarget(datum);

			if (target !== undefined) {
				setter(datum, Date.now());
			}
		}
	})
});

export class ModelField implements ModelFieldInterface {
	settings: ModelFieldSettings;
	externalGetter: ModelFieldGetter;
	externalSetter: ModelFieldSetter;
	internalGetter: ModelFieldGetter;
	internalSetter: ModelFieldSetter;

	constructor(settings: ModelFieldSettings) {
		if (!settings.internal) {
			settings.internal = settings.external;
		}

		if (!settings.storage) {
			settings.storage = settings.internal;
		}

		if (settings.usage) {
			// TODO: if unknown usage, toss an error
			Object.assign(settings, usages.get(settings.usage) || {});
		}

		this.settings = settings;

		this.externalGetter = makeGetter(settings.external);
		this.externalSetter = makeSetter(settings.external);

		const isFlat = settings.isFlat;
		this.internalGetter = isFlat
			? function (datum) {
					return datum[settings.internal];
			  }
			: makeGetter(settings.internal);
		this.internalSetter = isFlat
			? function (datum, value) {
					datum[settings.storage] = value;
			  }
			: makeSetter(settings.storage);
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
