export type TypingReference = string;

// TODO: support protobuf => protobufjs
export interface TypingAlias {
	json: string;
	typescript: string;
	python: string;
}

export interface TypingInfo {
	validations: string[];
}

export interface TypingJSON {
	alias: TypingAlias;
	info: TypingInfo;
}

export interface TypingInterface<T extends TypingJSON = TypingJSON> {
	define(types: Record<TypingReference, T>);
	addType(type: TypingReference, info: T): void;
	getType(type: TypingReference): T;
}
