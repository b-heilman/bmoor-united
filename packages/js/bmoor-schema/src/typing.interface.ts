export type TypingReference = string;

export interface TypingInfo {
	json: string;
}

export interface TypingInterface {
	addType(type: TypingReference, info: TypingInfo): void;
	getType(type: TypingReference): TypingInfo;
}
