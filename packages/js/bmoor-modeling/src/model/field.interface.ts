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
}

export interface ModelFieldInterface extends FieldInterface {
	getInfo(): ModelFieldInfo;
}
