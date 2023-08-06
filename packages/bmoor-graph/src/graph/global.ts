import {DatumInterface} from '@bmoor/compute';
import {Features} from '@bmoor/graph/src/features';

import {NodeSelector} from '../node.interface';

export class GraphGlobal implements DatumInterface<NodeSelector> {
	features: Features;

	constructor(features: Features) {
		this.features = features;
	}

	hasValue(attr: string): boolean {
		return this.features.hasValue(attr);
	}

	// get the value, could be an async source
	async getValue(attr: string): Promise<number> {
		return this.features.getValue(attr);
	}

	// set the value
	// TODO: I don't think I want to suppore mode here
	async setValue(attr: string, value: number): Promise<boolean> {
		this.features.setValue(attr, value);

		return true;
	}

	select() {
		return [this];
	}
}
