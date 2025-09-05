import {DynamicObject} from '@bmoor/object';
import {Path, PathInterface} from '@bmoor/path';
import {Field} from '@bmoor/schema';

import {
	ModelFieldInfo,
	ModelFieldInterface,
	ModelFieldJSON,
} from './field.interface.ts';

export class ModelField<T = unknown>
	extends Field<T>
	implements ModelFieldInterface
{
	source: ModelFieldJSON;
	storagePath: PathInterface<T>;

	constructor(schema: ModelFieldJSON) {
		super(schema);

		if (schema.storagePath) {
			this.storagePath = new Path(schema.storagePath);
		} else {
			this.storagePath = this.path;
		}
	}

	getInfo(): ModelFieldInfo {
		return this.source.info;
	}

	getStoragePath(): string {
		return this.source.storagePath || this.getPath();
	}

	readStorage(root: DynamicObject<T>): T {
		return this.storagePath.read(root);
	}

	writeStorage(root: DynamicObject<T>, v: T): void {
		return this.storagePath.write(root, v);
	}
}
