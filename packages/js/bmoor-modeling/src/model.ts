import {Mapping} from '@bmoor/path';
import {
	ConnectionActionsType,
	Schema,
	reduceStructure,
} from '@bmoor/schema';

import {ModelInterface, ModelSettings} from './model.interface';

/***
 * A Model is all about the data's structure.  Actions to be performed against the model will
 * be in the service.
 ***/
export class Model<
		ActionsT extends ConnectionActionsType = ConnectionActionsType,
	>
	extends Schema<ActionsT>
	implements ModelInterface
{
	deflator: {
		from: Mapping;
		to: Mapping;
	};
	inflator: {
		from: Mapping;
		to: Mapping;
	};

	constructor(settings: ModelSettings<ActionsT>) {
		super(settings);

		if (settings.inflate) {
			const mappings = reduceStructure(settings.inflate).map((field) => ({
				from: field.path,
				to: this.getField(field.ref).getPath(),
			}));

			this.inflator = {
				from: new Mapping(mappings),
				to: new Mapping(mappings.map((m) => ({from: m.to, to: m.from}))),
			};
		} else {
			this.inflator = null;
		}

		if (settings.deflate) {
			const mappings = reduceStructure(settings.deflate).map((field) => ({
				from: field.path,
				to: this.getField(field.ref).getPath(),
			}));

			this.deflator = {
				from: new Mapping(mappings),
				to: new Mapping(mappings.map((m) => ({from: m.to, to: m.from}))),
			};
		} else {
			this.deflator = null;
		}
	}

	inflate(obj) {
		if (this.inflator) {
			return this.inflator.to.transform(obj);
		} else {
			return obj;
		}
	}

	fromInflated(obj) {
		if (this.inflator) {
			return this.inflator.from.transform(obj);
		} else {
			return obj;
		}
	}

	deflate(obj) {
		if (this.deflator) {
			return this.deflator.to.transform(obj);
		} else {
			return obj;
		}
	}

	fromDeflated(obj) {
		if (this.deflator) {
			return this.deflator.from.transform(obj);
		} else {
			return obj;
		}
	}
}
