
import { ConfigObject } from '@bmoor/config';
import { State } from '@bmoor/state';

import { Token } from './'
type Root = string;

interface Positioning {
	pos: number,
	begin?: number,
	end?: number
};

class ParserInterface {
	open: (root: Root, pos: Positioning, state: State) => Positioning,
	close: (root: Root, pos: Positioning, state: State) => Positioning,
	toToken: (content: Root, state: State) => Token
}

abstract class Parser extends ConfigObject implements ParserInterface {

}