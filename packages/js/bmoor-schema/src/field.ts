import {DynamicObject} from '@bmoor/object';
import {Path, PathInterface} from '@bmoor/path';

import type {
	FieldInfo,
	FieldInterface,
	FieldJSON,
	FieldPathLink,
	FieldReference,
	FieldType,
} from './field.interface.ts';

import type {
	SchemaInterface
} from './schema.interface.ts'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export class Field<T = any> implements FieldInterface {
	path: PathInterface<T>;
	schema: SchemaInterface;
	settings: FieldJSON;

	constructor(schema: SchemaInterface, settings: FieldJSON) {
		this.path = new Path(settings.path);
		this.schema = schema;
		this.settings = settings;
	}

	getSchema(): SchemaInterface {
		return this.schema;
	}

	getReference(): FieldReference {
		return this.settings.ref || this.settings.path;
	}

	getType(): FieldType {
		return this.settings.info.type;
	}

	getInfo(): FieldInfo {
		return this.settings.info;
	}

	getPath(): string {
		return this.settings.path;
	}

	getPathChain(): FieldPathLink[] {
		const chain = this.path.getChain();

		return chain.map((link) => {
			if (link.type === 'leaf') {
				return Object.assign(link, {
					fieldType: this.getType(),
				});
			} else {
				return link;
			}
		});
	}

	read(root: DynamicObject<T>): T {
		return this.path.read(root);
	}

	write(root: DynamicObject<T>, v: T): void {
		return this.path.write(root, v);
	}
}
