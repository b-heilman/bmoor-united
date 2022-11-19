import {FormatInterface} from './format.interface';

export interface ColumnInterface extends FormatInterface {
	heading?: string;
}

export interface PrettyInteface {
	header?: string;
	heading?: string;
	headerFormat?: FormatInterface;
	separator?: string;
	columns: Record<string, ColumnInterface>;
}
