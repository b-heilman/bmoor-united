import {FieldType} from '@bmoor/schema';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ConvertFn<InputT = any, OutputT = any> = (
	x: InputT,
) => OutputT;

export interface ConveterInterface {
	define(converters: Record<FieldType, Record<FieldType, ConvertFn>>);
	addConverter(from: FieldType, to: FieldType, ConvertFn): void;
	getConverter(from: FieldType, to: FieldType): ConvertFn;
}
