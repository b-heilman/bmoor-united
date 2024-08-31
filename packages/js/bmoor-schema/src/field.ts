import {DynamicObject} from '@bmoor/object';
import {Path, PathInterface} from '@bmoor/path';

import {
	FieldInfo,
	FieldInterface,
	FieldJSON,
	FieldPathLink,
	FieldReference,
} from './field.interface';
import {SchemaContextInterface} from './schema/context.interface';
import {ValidationJSON} from './validation.interface';

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
					fieldType: this.source.info.type,
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

	setValidator(settings: ValidationJSON) {
		this.validation = settings;
	}

	validate(
		ctx: SchemaContextInterface,
		root: DynamicObject<T>,
		mode: 'create' | 'update' = 'create',
	): Promise<string> {
		if (this.validation) {
			const validation = ctx.getValidation(this.validation.reference);
			return validation(this.read(root), this.getInfo(), mode);
		} else {
			return null;
		}
	}
}
