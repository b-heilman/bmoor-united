import {Expressable} from '@bmoor/compiler';

export type mapping = {
	from: string;
	to: string;
};

export type MappingIndex = Map<
	string,
	{
		exp: Expressable;
		next?: MappingIndex;
		ref?: string;
	}
>;
