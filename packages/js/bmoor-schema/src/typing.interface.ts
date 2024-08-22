export type TypingReference = string;

// TODO: support protobuf => protobufjs
export interface TypingJSON {
	json: string;
	typescript: string;
}

export interface TypingInterface<T extends TypingJSON = TypingJSON> {
	define(types: Record<TypingReference, T>);
	addType(type: TypingReference, info: T): void;
	getType(type: TypingReference): T;
}
