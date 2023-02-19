import {FormatInterface} from './format.interface';

export interface ColumnInterface extends FormatInterface {
	heading?: string;
}

export interface PrettyArraySettings {
	header?: string;
	heading?: string;
	headerFormat?: FormatInterface;
	separator?: string;
	columns: Record<string, ColumnInterface>;
}
