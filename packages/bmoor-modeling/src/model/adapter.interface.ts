import {SearchDatum} from '../datum.interface';
import {DeltaKeyReader} from './properties.interface';

export interface ModelAdapterInterface<Delta, Internal> {
	create(content: Internal[]): Promise<Internal[]>;
	read(ids: string[]): Promise<Internal[]>;
	update(content: Delta[], fn: DeltaKeyReader<Delta>): Promise<Internal[]>;
	delete?(content: Internal[]): Promise<Internal[]>;
	search?(search: SearchDatum): Promise<Internal[]>;
}
