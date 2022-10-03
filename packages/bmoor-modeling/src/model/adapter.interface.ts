import {SearchDatum} from '../datum.interface';
import {DeltaKeyReader} from './accessor.interface';
import {ModelKey} from '../datum.interface';

export interface ModelAdapterInterface<Delta, Internal> {
	create(content: Internal[]): Promise<Internal[]>;
	read(ids: ModelKey[]): Promise<Internal[]>;
	update(content: Delta[], fn: DeltaKeyReader<Delta>): Promise<Internal[]>;
	delete?(ids: ModelKey[]): Promise<number>; // return the rows deleted
	search?(search: SearchDatum): Promise<Internal[]>;
}
