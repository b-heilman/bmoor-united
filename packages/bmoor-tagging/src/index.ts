export type Tags = string[];

export class Tagging<T> {
	index: Map<string, T[]>;

	constructor() {
		this.index = new Map();
	}

	add(reference: T, tags: Tags = []) {
		for (const tag of tags) {
			if (this.index.has(tag)) {
				this.index.get(tag).push(reference);
			} else {
				this.index.set(tag, [reference]);
			}
		}
	}

	has(tag: string) {
		return this.index.has(tag);
	}

	get(tag: string): T[] {
		return this.index.get(tag) || [];
	}

	keys(): string[] {
		return Array.from(this.index.keys());
	}
}
