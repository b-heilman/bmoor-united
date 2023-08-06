import {DatumInterface} from './datum.interface';

export class Datum<NodeSelector> implements DatumInterface<NodeSelector> {
	ref: string;
	data: Map<string, number>;

	constructor(ref: string, src: Record<string, number>) {
		this.ref = ref;
		this.data = new Map();

		for (const key in src) {
			this.data.set(key, src[key]);
		}
	}

	hasValue(attr: string) {
		return this.data.has(attr);
	}

	async getValue(attr: string) {
		return this.data.get(attr);
	}

	async setValue(attr: string, value: number) {
		this.data.set(attr, value);

		return true;
	}

	select() {
		return [this];
	}
}
