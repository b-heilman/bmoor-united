import {SearchDatum} from '../datum.interface';
import {DeltaKeyReader} from './accessor.interface';

export interface ModelAdapterInterface<Reference, Delta, Internal> {
	create(content: Internal[]): Promise<Internal[]>;
	read(ids: Reference[]): Promise<Internal[]>;
	update(content: Delta[], fn: DeltaKeyReader<Delta>): Promise<Internal[]>;
	delete?(ids: Reference[]): Promise<number>; // return the rows deleted
	search?(search: SearchDatum): Promise<Internal[]>;
}
