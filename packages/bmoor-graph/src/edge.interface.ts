import {NodeInterface} from './node.interface';

export type EdgeLabel = string;

export interface EdgeInterface {
	label: EdgeLabel;
	target: NodeInterface;
}
