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
import type {ValidationJSON} from './validation.interface.ts';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export class Field<T = any> implements FieldInterface {
	source: FieldJSON;
	path: PathInterface<T>;
	validation: ValidationJSON;

	constructor(schema: FieldJSON) {
		this.path = new Path(schema.path);
		this.source = schema;
	}

	getReference(): FieldReference {
		return this.source.ref || this.source.path;
	}

	getType(): FieldType {
		if ('alias' in this.source.info) {
			return this.source.info.alias.getType();
		} else {
			return this.source.info.type;
		}
	}

	getInfo(): FieldInfo {
		return this.source.info;
	}

	getPath(): string {
		return this.source.path;
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
