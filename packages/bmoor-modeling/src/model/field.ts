import {Config, ConfigObject} from '@bmoor/config';
import {makeSetter, makeGetter} from '@bmoor/object';
import {ContextSecurityInterface} from '@bmoor/context';

import {
	ModelFieldInterface,
	ModelFieldSettings,
	ModelFieldUsage,
	ModelFieldTypescript,
	TypescriptUsage,
	ModelFieldTypescriptInfo,
	ModelFieldSetter,
	ModelFieldGetter,
	ModelFieldActions,
	ModelFieldContext
} from './field.interface';

export const usages = new Config({
	key: new ConfigObject<ModelFieldUsage>({
		isKey: true,
		canCreate: false,
		canUpdate: false
	}),
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
		onDeflate: function (datum, setter, getter, ctx, cfg) {
			const target = cfg.getTarget(datum);

			if (target !== undefined) {
				setter(datum, Date.now());
			}
		}
	})
});

function buildActions(field: ModelField): ModelFieldActions {
	const rtn: ModelFieldActions = {};
	const getter = field.externalGetter;
	const setter = field.externalSetter;
	const callCtx: ModelFieldContext = {};
	const settings = field.settings;

	if (settings.config) {
		const cfg = settings.config;
		// this is to allow one field type to watch another field type
		if (cfg.target) {
			callCtx.getTarget = makeGetter(cfg.target);
		}
	}

	// TODO: make sure these are compatible with arrays
	if (settings.onInflate) {
		rtn.inflate = function (datum, ctx: ContextSecurityInterface) {
			settings.onInflate(datum, setter, getter, ctx, callCtx);

			return datum;
		};
	}

	if (settings.onDeflate) {
		rtn.deflate = function (datum, ctx: ContextSecurityInterface) {
			settings.onDeflate(datum, setter, getter, ctx, callCtx);

			return datum;
		};
	}

	if (settings.onCreate) {
		rtn.create = function (datum, ctx: ContextSecurityInterface) {
			settings.onCreate(datum, setter, getter, ctx, callCtx);

			return datum;
		};
	}

	if (settings.onRead) {
		rtn.read = function (datum, ctx: ContextSecurityInterface) {
			settings.onRead(datum, setter, getter, ctx, callCtx);

			return datum;
		};
	}

	if (settings.onUpdate) {
		rtn.update = function (datum, ctx: ContextSecurityInterface) {
			settings.onUpdate(datum, setter, getter, ctx, callCtx);

			return datum;
		};
	}

	if (settings.onDelete) {
		rtn.delete = function (datum, ctx: ContextSecurityInterface) {
			settings.onDelete(datum, setter, getter, ctx, callCtx);

			return datum;
		};
	}

	return rtn;
}

export class ModelField implements ModelFieldInterface {
	settings: ModelFieldSettings;
	actions: ModelFieldActions;
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
			settings = Object.assign({}, usages.get(settings.usage), settings);
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

		this.actions = buildActions(this);
	}

	toTypescript(): ModelFieldTypescript {
		const format = this.settings.jsonType;

		// TODO: how many types do I really need?
		const external = <ModelFieldTypescriptInfo>{
			path: this.settings.external,
			format
		};

		const internal = <ModelFieldTypescriptInfo>{
			path: this.settings.internal,
			format
		};

		const rtn = {
			external: <TypescriptUsage>{
				read: external
			},
			internal: <TypescriptUsage>{
				read: internal
			}
		};

		if (this.settings.isKey) {
			rtn.external.reference = external;
			rtn.internal.reference = internal;
		}

		if (!('canCreate' in this.settings) || this.settings.canCreate) {
			rtn.external.create = external;
			rtn.internal.create = internal;
		}

		if (!('canUpdate' in this.settings) || this.settings.canUpdate) {
			rtn.external.update = external;
			rtn.internal.update = internal;
		}

		if (this.settings.canSearch) {
			rtn.external.search = external;
			rtn.internal.search = internal;
		}

		return rtn;
	}
}
