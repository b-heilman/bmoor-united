import type {FieldInfo} from './field.interface.ts';

export type ValidationReference = string;

export type ValidationError = string | null;

// Only returns a string if invalid, otherwise returns null
export type ValidationFn = (
	value: any, // eslint-disable-line  @typescript-eslint/no-explicit-any
	info: FieldInfo,
) => Promise<ValidationError>;

export interface ValidationJSON {
	reference: ValidationReference;
}
