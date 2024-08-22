import {DynamicObject} from '@bmoor/object';
import {
	FieldInfo,
	FieldInterface,
	FieldJSON,
	FieldType,
} from '@bmoor/schema';

export interface ModelFieldInfo extends FieldInfo {
	external?: FieldType;
	storage?: FieldType;
}

export interface ModelFieldJSON extends FieldJSON {
	info: ModelFieldInfo;
	externalPath: string;
	storagePath: string;
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export interface ModelFieldInterface<T = any> extends FieldInterface<T> {
	getInfo(): ModelFieldInfo;
	getStoragePath(): string;
	readStorage(root: DynamicObject<T>): T;
	writeStorage(root: DynamicObject<T>, v: T);
}
