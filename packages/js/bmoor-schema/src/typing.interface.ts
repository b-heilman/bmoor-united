export type TypingReference = string;

export interface TypingJSON {
	json: string;
}

export interface TypingInterface<T extends TypingJSON = TypingJSON> {
	define(types: Record<TypingReference, T>);
	addType(type: TypingReference, info: T): void;
	getType(type: TypingReference): T;
}
