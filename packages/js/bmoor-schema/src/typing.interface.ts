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

export interface TypingJSON<T extends TypingAlias> {
	alias: T;
	info: TypingInfo;
}

export interface TypingInterface<TypeT extends TypingAlias = TypingAlias> {
	define(types: Record<TypingReference, TypingJSON<TypeT>>);
	addType(type: TypingReference, info: TypingJSON<TypeT>): void;
	getType(type: TypingReference): TypingJSON<TypeT>;

	addValidation(type: TypingReference, validation: string);
	removeValidation(type: TypingReference, validation: string);

	extend<ExtendedT extends TypeT>(
		types: Record<TypingReference, Omit<ExtendedT, keyof TypeT>>,
	): TypingInterface<ExtendedT>;

	clone(): TypingInterface<TypeT>;
}
