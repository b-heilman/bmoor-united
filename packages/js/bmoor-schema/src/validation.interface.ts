import {FieldInfo} from './field.interface.ts';

export type ValidationReference = string;

// Only returns a string if invalid, otherwise returns null
export type ValidationFn = (
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	value: any,
	info: FieldInfo,
	mode: 'create' | 'update',
) => Promise<string>;

export interface ValidationJSON {
	reference: ValidationReference;
}
